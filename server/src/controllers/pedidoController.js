// server/src/controllers/pedidoController.js
import db from '../db/pool.js';
import { crearFacturaAFIP } from '../services/arcaService.js';
import { generarTicket } from '../services/pdfService.js' 
const calcularTotales = (detalles) => {
  const total = detalles.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const neto = parseFloat((total / 1.21).toFixed(2));
  const iva = parseFloat((total - neto).toFixed(2));
  return { total, neto, iva };
};

// ========== FUNCIONES EXISTENTES ADAPTADAS ==========

export const getPedidoActivoPorMesa = async (req, res) => {
  const { mesaId } = req.params;
  try {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE mesa_id = ? AND estado = ?').get(mesaId, 'abierto');
    if (!pedido) {
      return res.json(null);
    }
    const detalles = db.prepare(`
      SELECT pd.*, p.nombre, p.precio as precio_actual
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      WHERE pd.pedido_id = ?
    `).all(pedido.id);
    res.json({ ...pedido, detalles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const crearPedido = async (req, res) => {
  const { mesa_id } = req.body;
  try {
    const updateMesa = db.prepare('UPDATE mesas SET estado = ? WHERE id = ?');
    updateMesa.run('ocupada', mesa_id);

    const insertPedido = db.prepare('INSERT INTO pedidos (mesa_id, estado) VALUES (?, ?) RETURNING *');
    const pedido = insertPedido.get(mesa_id, 'abierto');
    res.status(201).json(pedido);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const agregarProducto = (req, res) => {
  const { id } = req.params;
  const { producto_id, cantidad } = req.body;

  try {
    const producto = db.prepare(
      'SELECT * FROM productos WHERE id = ?'
    ).get(producto_id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const precio_unitario = Number(producto.precio);
    const subtotal = precio_unitario * cantidad;

    db.prepare(`
      INSERT INTO pedido_detalle
      (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, producto_id, cantidad, precio_unitario, subtotal);

    db.prepare(`
      UPDATE pedidos
      SET total = COALESCE(total, 0) + ?
      WHERE id = ?
    `).run(subtotal, id);

    res.json({
      message: 'Producto agregado',
      subtotal
    });

  } catch (error) {
    console.error("🔥 ERROR agregarProducto:");
    console.error(error);

    res.status(500).json({
      error: error.message
    });
  }
};

export const eliminarProducto = async (req, res) => {
  const { detalleId } = req.params;
  const transaction = db.transaction(() => {
    const detalle = db.prepare('SELECT pedido_id, subtotal FROM pedido_detalle WHERE id = ?').get(detalleId);
    if (!detalle) throw new Error('Detalle no encontrado');
    const { pedido_id, subtotal } = detalle;

    db.prepare('DELETE FROM pedido_detalle WHERE id = ?').run(detalleId);
    db.prepare('UPDATE pedidos SET total = COALESCE(total, 0) - ? WHERE id = ?').run(subtotal, pedido_id);
  });

  try {
    transaction();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};





export const cerrarPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'abierto') {
      return res.status(400).json({ error: 'El pedido ya está cerrado' });
    }

    const detalles = db
      .prepare('SELECT subtotal FROM pedido_detalle WHERE pedido_id = ?')
      .all(id);

    if (detalles.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene detalles' });
    }

    const { total, neto, iva } = calcularTotales(detalles);

    // 1️⃣ PASO: marcar como pendiente
    db.prepare(`
      UPDATE pedidos 
      SET estado = ?
      WHERE id = ?
    `).run('pendiente_factura', id);

    let factura;

    try {
      // 2️⃣ Facturar en AFIP
      factura = factura = await crearFacturaAFIP({
        total,
        neto,
        iva,
        puntoDeVenta: Number(process.env.ARCA_PTO_VTA || 1),
      });
    } catch (afipError) {
      console.error('Error AFIP:', afipError);

      return res.status(500).json({
        error: 'Error al facturar en AFIP',
        detalle: afipError.message,
        pedidoEstado: 'pendiente_factura',
      });
    }

    // ✅ obtener detalles con nombre para el ticket
    const detallesConNombre = db.prepare(`
      SELECT pd.*, p.nombre
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      WHERE pd.pedido_id = ?
    `).all(id);

    // ✅ generar ticket PDF
    const filePath = generarTicket(
      { ...pedido, total },
      detallesConNombre,
      factura
    );

    // 3️⃣ Transacción final
    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE pedidos
        SET estado = ?,
            total = ?,
            factura_numero = ?,
            cae = ?,
            cae_vto = ?
        WHERE id = ?
      `).run(
        'cerrado',
        total,
        factura.numeroFactura,
        factura.cae,
        factura.vencimientoCAE,
        id
      );

      db.prepare(`
        UPDATE mesas 
        SET estado = ? 
        WHERE id = ?
      `).run('libre', pedido.mesa_id);
    });

    transaction();

    res.json({
      message: 'Pedido cerrado, facturado y ticket generado',
      factura,
      ticket: `/tickets/factura-${factura.numeroFactura}.pdf`
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: error.message,
    });
  }
};


export const refacturarPedido = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'pendiente_factura') {
      return res.status(400).json({
        error: 'Este pedido no requiere refacturación'
      });
    }

    const detalles = db
      .prepare('SELECT subtotal FROM pedido_detalle WHERE pedido_id = ?')
      .all(id);

    if (!detalles || detalles.length === 0) {
      return res.status(400).json({ error: 'Sin detalles en el pedido' });
    }

    const total = detalles.reduce((sum, d) => sum + Number(d.subtotal), 0);
    const neto = Number((total / 1.21).toFixed(2));
    const iva = Number((total - neto).toFixed(2));

    // ✅ FACTURA MOCK
    const factura = {
      numeroFactura: Math.floor(Math.random() * 10000),
      cae: 'TEST-CAE-123456',
      vencimientoCAE: new Date().toISOString().slice(0, 10),
    };

    const transaction = db.transaction(() => {
      db.prepare(`
        UPDATE pedidos
        SET estado = ?,
            factura_numero = ?,
            cae = ?,
            cae_vto = ?
        WHERE id = ?
      `).run(
        'cerrado',
        factura.numeroFactura,
        factura.cae,
        factura.vencimientoCAE,
        id
      );
    });

    transaction();

    res.json({
      message: 'Pedido refacturado correctamente',
      factura
    });

  } catch (error) {
  console.error("🔥 ERROR REFAC:");
  console.error(error);

  res.status(500).json({
    error: error.message,
    stack: error.stack
  });
}
  
};
// ========== NUEVAS FUNCIONES PARA CRUD COMPLETO ==========

export const getPedidos = async (req, res) => {
  try {
    const { estado } = req.query;
    let sql = 'SELECT * FROM pedidos';
    const params = [];
    if (estado) {
      sql += ' WHERE estado = ?';
      params.push(estado);
    }
    sql += ' ORDER BY id DESC';
    const stmt = db.prepare(sql);
    const pedidos = stmt.all(...params);
    res.json(pedidos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getPedidoById = async (req, res) => {
  const { id } = req.params;
  try {
    const pedido = db.prepare('SELECT * FROM pedidos WHERE id = ?').get(id);
    if (!pedido) return res.status(404).json({ error: 'Pedido no encontrado' });
    const detalles = db.prepare(`
      SELECT pd.*, p.nombre, p.precio as precio_actual
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      WHERE pd.pedido_id = ?
    `).all(id);
    res.json({ ...pedido, detalles });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const actualizarPedido = async (req, res) => {
  const { id } = req.params;
  const { estado, comentarios } = req.body;
  try {
    const result = db.prepare(`
      UPDATE pedidos
      SET estado = COALESCE(?, estado),
          comentarios = COALESCE(?, comentarios)
      WHERE id = ?
      RETURNING *
    `).get(estado, comentarios, id);
    if (!result) return res.status(404).json({ error: 'Pedido no encontrado' });
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const eliminarPedido = async (req, res) => {
  const { id } = req.params;
  const transaction = db.transaction(() => {
    const pedido = db.prepare('SELECT mesa_id, estado FROM pedidos WHERE id = ?').get(id);
    if (!pedido) throw new Error('Pedido no encontrado');
    const { mesa_id, estado } = pedido;

    db.prepare('DELETE FROM pedido_detalle WHERE pedido_id = ?').run(id);
    db.prepare('DELETE FROM pedidos WHERE id = ?').run(id);
    if (estado === 'abierto' && mesa_id) {
      db.prepare('UPDATE mesas SET estado = ? WHERE id = ?').run('libre', mesa_id);
    }
  });

  try {
    transaction();
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};