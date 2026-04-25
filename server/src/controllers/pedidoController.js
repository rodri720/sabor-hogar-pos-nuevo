import pool from '../db/pool.js';

// Obtener pedido activo de una mesa (abierto)
export const getPedidoActivoPorMesa = async (req, res) => {
  const { mesaId } = req.params;
  try {
    // Buscar pedido abierto
    const pedidoResult = await pool.query(
      'SELECT * FROM pedidos WHERE mesa_id = $1 AND estado = $2',
      [mesaId, 'abierto']
    );
    if (pedidoResult.rows.length === 0) {
      return res.json(null);
    }
    const pedido = pedidoResult.rows[0];
    // Obtener detalles
    const detalles = await pool.query(
      `SELECT pd.*, p.nombre, p.precio as precio_actual 
       FROM pedido_detalle pd 
       JOIN productos p ON pd.producto_id = p.id 
       WHERE pd.pedido_id = $1`,
      [pedido.id]
    );
    res.json({ ...pedido, detalles: detalles.rows });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Crear nuevo pedido (abrir mesa)
export const crearPedido = async (req, res) => {
  const { mesa_id } = req.body;
  try {
    // Cambiar estado de mesa a ocupada
    await pool.query('UPDATE mesas SET estado = $1 WHERE id = $2', ['ocupada', mesa_id]);
    // Crear pedido
    const result = await pool.query(
      'INSERT INTO pedidos (mesa_id, estado) VALUES ($1, $2) RETURNING *',
      [mesa_id, 'abierto']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Agregar producto al pedido
export const agregarProducto = async (req, res) => {
  const { pedido_id, producto_id, cantidad } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Obtener precio del producto
    const producto = await client.query('SELECT precio FROM productos WHERE id = $1', [producto_id]);
    const precio_unitario = parseFloat(producto.rows[0].precio);
    const subtotal = precio_unitario * cantidad;

    // Insertar detalle
    const detalle = await client.query(
      `INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pedido_id, producto_id, cantidad, precio_unitario, subtotal]
    );

    // Actualizar total del pedido
    await client.query(
      'UPDATE pedidos SET total = total + $1 WHERE id = $2',
      [subtotal, pedido_id]
    );

    await client.query('COMMIT');
    res.status(201).json(detalle.rows[0]);
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Eliminar un producto del pedido
export const eliminarProducto = async (req, res) => {
  const { detalleId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const detalle = await client.query('SELECT pedido_id, subtotal FROM pedido_detalle WHERE id = $1', [detalleId]);
    if (detalle.rows.length === 0) {
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    const { pedido_id, subtotal } = detalle.rows[0];
    await client.query('DELETE FROM pedido_detalle WHERE id = $1', [detalleId]);
    await client.query('UPDATE pedidos SET total = total - $1 WHERE id = $2', [subtotal, pedido_id]);
    await client.query('COMMIT');
    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// Cerrar pedido (cobrar / facturar)
export const cerrarPedido = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // Actualizar estado del pedido a 'cerrado'
    const pedido = await client.query(
      'UPDATE pedidos SET estado = $1 WHERE id = $2 RETURNING mesa_id',
      ['cerrado', id]
    );
    const mesaId = pedido.rows[0].mesa_id;
    // Liberar mesa
    await client.query('UPDATE mesas SET estado = $1 WHERE id = $2', ['libre', mesaId]);
    await client.query('COMMIT');
    res.json({ message: 'Pedido cerrado correctamente' });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};