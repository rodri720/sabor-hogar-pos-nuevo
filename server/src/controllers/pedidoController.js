import pool from '../db/pool.js';
import { facturarVenta } from '../services/arcaService.js';

const calcularTotales = (detalles) => {
  const total = detalles.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const neto = parseFloat((total / 1.21).toFixed(2));
  const iva = parseFloat((total - neto).toFixed(2));
  return { total, neto, iva };
};

export const getPedidoActivoPorMesa = async (req, res) => {
  const { mesaId } = req.params;
  try {
    const pedidoResult = await pool.query(
      'SELECT * FROM pedidos WHERE mesa_id = $1 AND estado = $2',
      [mesaId, 'abierto']
    );
    if (pedidoResult.rows.length === 0) {
      return res.json(null);
    }
    const pedido = pedidoResult.rows[0];
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

export const crearPedido = async (req, res) => {
  const { mesa_id } = req.body;
  try {
    await pool.query('UPDATE mesas SET estado = $1 WHERE id = $2', ['ocupada', mesa_id]);
    const result = await pool.query(
      'INSERT INTO pedidos (mesa_id, estado) VALUES ($1, $2) RETURNING *',
      [mesa_id, 'abierto']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const agregarProducto = async (req, res) => {
  const { pedido_id, producto_id, cantidad } = req.body;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const producto = await client.query('SELECT precio FROM productos WHERE id = $1', [producto_id]);
    if (producto.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    const precio_unitario = parseFloat(producto.rows[0].precio);
    const subtotal = precio_unitario * cantidad;

    const detalle = await client.query(
      `INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [pedido_id, producto_id, cantidad, precio_unitario, subtotal]
    );

    await client.query(
      'UPDATE pedidos SET total = COALESCE(total, 0) + $1 WHERE id = $2',
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

export const eliminarProducto = async (req, res) => {
  const { detalleId } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const detalle = await client.query(
      'SELECT pedido_id, subtotal FROM pedido_detalle WHERE id = $1',
      [detalleId]
    );
    if (detalle.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Detalle no encontrado' });
    }
    const { pedido_id, subtotal } = detalle.rows[0];

    await client.query('DELETE FROM pedido_detalle WHERE id = $1', [detalleId]);
    await client.query('UPDATE pedidos SET total = COALESCE(total, 0) - $1 WHERE id = $2', [subtotal, pedido_id]);

    await client.query('COMMIT');
    res.status(204).send();
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

export const cerrarPedido = async (req, res) => {
  const { id } = req.params;
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const pedidoResult = await client.query(
      'SELECT id, mesa_id, estado FROM pedidos WHERE id = $1',
      [id]
    );
    if (pedidoResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Pedido no encontrado' });
    }
    const pedido = pedidoResult.rows[0];
    if (pedido.estado !== 'abierto') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El pedido ya está cerrado o no es cobrable' });
    }

    const detallesResult = await client.query(
      'SELECT subtotal FROM pedido_detalle WHERE pedido_id = $1',
      [id]
    );
    if (detallesResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'El pedido no tiene detalles' });
    }

    const { total, neto, iva } = calcularTotales(detallesResult.rows);
    const factura = await facturarVenta({
      total,
      neto,
      iva,
      puntoDeVenta: Number(process.env.ARCA_PTO_VTA || 1),
    });

    await client.query(
      `UPDATE pedidos
       SET estado = $1,
           total = $2,
           factura_numero = $3,
           cae = $4,
           cae_vto = $5
       WHERE id = $6`,
      ['cerrado', total, factura.numeroFactura, factura.cae, factura.vencimientoCAE, id]
    );

    await client.query('UPDATE mesas SET estado = $1 WHERE id = $2', ['libre', pedido.mesa_id]);

    await client.query('COMMIT');
    res.json({
      message: 'Pedido cobrado y facturado correctamente',
      factura,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};