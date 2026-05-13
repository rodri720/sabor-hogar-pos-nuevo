import db from '../db/pool.js';
import { crearFacturaAFIP } from '../services/arcaService.js';
import { generarTicket } from '../services/pdfService.js';
import { crearPreferenciaCobro } from '../services/mpPreferenceService.js';

const METODOS_PAGO = new Set([
  'efectivo',
  'debito',
  'tarjeta',
  'transferencia',
  'qr',
]);

const calcularTotales = (detalles) => {
  const total = detalles.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const neto = parseFloat((total / 1.21).toFixed(2));
  const iva = parseFloat((total - neto).toFixed(2));
  return { total, neto, iva };
};

// ====================== PEDIDO ACTIVO ======================
export const getPedidoActivoPorMesa = (req, res) => {
  const { mesaId } = req.params;

  console.log("📥 getPedidoActivoPorMesa:", mesaId);

  try {
    const pedido = db.prepare(`
      SELECT * FROM pedidos 
      WHERE mesa_id = ? AND estado = 'abierto'
    `).get(mesaId);

    if (!pedido) {
      console.log("❌ No hay pedido activo para mesa", mesaId);
      return res.json(null);
    }

    const detalles = db.prepare(`
      SELECT pd.*, p.nombre
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      WHERE pd.pedido_id = ?
    `).all(pedido.id);

    console.log("✅ Pedido activo encontrado:", pedido.id);

    res.json({ ...pedido, detalles });

  } catch (error) {
    console.error("🔥 ERROR getPedidoActivoPorMesa:", error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== CREAR PEDIDO ======================
export const crearPedido = (req, res) => {
  const { mesa_id } = req.body;

  console.log("➕ crearPedido para mesa:", mesa_id);

  try {
    const mesa = db.prepare('SELECT id FROM mesas WHERE id = ?').get(mesa_id);
    if (!mesa) {
      return res.status(400).json({
        error: 'Mesa inexistente. Ejecutá el seed o recreá mesas (el id de mesa debe existir en la base).',
      });
    }

    // ✅ siempre crear uno nuevo limpio
    const pedido = db.prepare(`
      INSERT INTO pedidos (mesa_id, estado, total)
      VALUES (?, 'abierto', 0)
      RETURNING *
    `).get(mesa_id);

    // ✅ actualizar mesa
    db.prepare(`
      UPDATE mesas SET estado = 'ocupada'
      WHERE id = ?
    `).run(mesa_id);

    console.log("✅ pedido nuevo creado:", pedido.id);

    res.status(201).json(pedido);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== AGREGAR PRODUCTO ======================
export const agregarProducto = (req, res) => {
  const { id } = req.params;
  const { producto_id, cantidad } = req.body;

  console.log("🛒 agregarProducto:", {
    pedidoId: id,
    producto_id,
    cantidad
  });

  try {
    // ✅ 🔥 FIX CLAVE: validar solo existencia (NO estado)
    const pedido = db.prepare(`
      SELECT * FROM pedidos WHERE id = ?
    `).get(id);

    if (!pedido) {
      console.log("❌ Pedido no existe");
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    const producto = db.prepare(
      'SELECT * FROM productos WHERE id = ?'
    ).get(producto_id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const precio = Number(producto.precio);
    const subtotal = precio * cantidad;

    db.prepare(`
      INSERT INTO pedido_detalle
      (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, producto_id, cantidad, precio, subtotal);

    db.prepare(`
      UPDATE pedidos
      SET total = total + ?
      WHERE id = ?
    `).run(subtotal, id);

    console.log("✅ Producto agregado correctamente");

    res.json({
      message: 'Producto agregado',
      subtotal
    });

  } catch (error) {
    console.error("🔥 ERROR agregarProducto:", error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== PREFERENCIA MERCADO PAGO (QR / link) ======================
export const preferenciaMercadoPago = async (req, res) => {
  const { id } = req.params;

  try {
    const pedido = db
      .prepare(`SELECT * FROM pedidos WHERE id = ? AND estado = 'abierto'`)
      .get(id);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido abierto no encontrado' });
    }

    const detalles = db
      .prepare(`
      SELECT pd.subtotal
      FROM pedido_detalle pd
      WHERE pd.pedido_id = ?
    `)
      .all(id);

    if (detalles.length === 0) {
      return res.status(400).json({ error: 'Sin productos' });
    }

    const { total } = calcularTotales(detalles);

    const pref = await crearPreferenciaCobro({
      pedidoId: id,
      monto: total,
      titulo: `Sabor Hogar — Pedido #${id}`,
    });

    if (!pref) {
      return res.status(503).json({
        configured: false,
        error:
          'Mercado Pago no configurado. Agregá MERCADOPAGO_ACCESS_TOKEN en server/.env',
      });
    }

    res.json({ configured: true, ...pref });
  } catch (error) {
    console.error('🔥 ERROR preferenciaMercadoPago:', error);
    res.status(500).json({ error: error.message || 'Error Mercado Pago' });
  }
};

// ====================== CERRAR PEDIDO ======================
export const cerrarPedido = async (req, res) => {
  const { id } = req.params;
  const metodoRaw = req.body?.metodo_pago;
  const metodo_pago = METODOS_PAGO.has(metodoRaw) ? metodoRaw : 'efectivo';

  console.log('💰 cerrarPedido ID:', id, 'metodo:', metodo_pago);

  try {
    const pedido = db.prepare(`
      SELECT * FROM pedidos WHERE id = ?
    `).get(id);

    console.log('📄 Pedido encontrado:', pedido);

    if (!pedido) {
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }

    if (pedido.estado !== 'abierto') {
      console.log('⚠ Pedido no está abierto:', pedido.estado);
      return res.status(400).json({ error: 'Pedido ya cerrado' });
    }

    const detalles = db
      .prepare(`
      SELECT pd.*, p.nombre
      FROM pedido_detalle pd
      JOIN productos p ON pd.producto_id = p.id
      WHERE pd.pedido_id = ?
    `)
      .all(id);

    console.log('📦 Detalles:', detalles);

    if (detalles.length === 0) {
      return res.status(400).json({ error: 'Sin productos' });
    }

    const { total, neto, iva } = calcularTotales(detalles);

    console.log('💵 Totales:', { total, neto, iva });

    db.transaction(() => {
      db.prepare(`
        UPDATE pedidos 
        SET estado = 'cerrado', total = ?, metodo_pago = ?
        WHERE id = ?
      `).run(total, metodo_pago, id);

      const info = db
        .prepare(`
        UPDATE mesas 
        SET estado = 'libre'
        WHERE id = ?
      `)
        .run(pedido.mesa_id);

      if (info.changes === 0) {
        throw new Error('No se encontró la mesa para liberar');
      }
    })();

    console.log('✅ Pedido cerrado y mesa liberada:', pedido.mesa_id);

    let factura = null;
    let ticket = null;
    let numeroFactura = null;

    try {
      factura = await crearFacturaAFIP({
        total,
        neto,
        iva,
        puntoDeVenta: Number(process.env.ARCA_PTO_VTA || 1),
      });

      numeroFactura = factura?.numeroFactura ?? null;

      ticket = generarTicket(
        { ...pedido, total, metodo_pago },
        detalles,
        factura
      );

      console.log('✅ Factura generada:', numeroFactura);
    } catch (err) {
      console.log('⚠ Error AFIP/PDF:', err.message);
    }

    try {
      db.prepare(`
        INSERT INTO ventas (numero_factura, total, metodo_pago, fecha, mesa_id, estado)
        VALUES (?, ?, ?, ?, ?, 'cerrado')
      `).run(
        numeroFactura,
        total,
        metodo_pago,
        new Date().toISOString(),
        pedido.mesa_id
      );
    } catch (e) {
      console.warn('⚠ No se pudo registrar venta:', e.message);
    }

    res.json({
      message: 'Pedido cerrado',
      metodo_pago,
      factura,
      ticket: ticket && factura
        ? `/tickets/factura-${factura.numeroFactura}.pdf`
        : null,
    });
  } catch (error) {
    console.error('🔥 ERROR cerrarPedido:', error);
    res.status(500).json({ error: error.message });
  }
};
