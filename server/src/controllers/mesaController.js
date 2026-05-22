import pool from '../db/pool.js';

export const liberarMesa = async (req, res) => {
  const mesaId = Number(req.params.id);
  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    // Verificar que la mesa existe
    const { rows: mesas } = await client.query('SELECT id FROM mesas WHERE id = $1', [mesaId]);
    if (mesas.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    // Obtener pedido activo
    const { rows: pedidos } = await client.query(
      'SELECT id FROM pedidos WHERE mesa_id = $1 AND estado = $2',
      [mesaId, 'abierto']
    );
    const pedido = pedidos[0];

    if (pedido) {
      // Eliminar detalles y el pedido
      await client.query('DELETE FROM pedido_detalle WHERE pedido_id = $1', [pedido.id]);
      await client.query('DELETE FROM pedidos WHERE id = $1', [pedido.id]);
    }

    // Liberar mesa
    await client.query('UPDATE mesas SET estado = $1 WHERE id = $2', ['libre', mesaId]);

    await client.query('COMMIT');
    res.json({ ok: true, message: 'Mesa liberada' });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('🔥 ERROR liberarMesa:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// También exporta los otros métodos (getMesas, updateMesaEstado) si los necesitas
export const getMesas = async (req, res) => {
  try {
    const { rows } = await pool.query(`
      SELECT m.id, m.numero,
        CASE
          WHEN EXISTS (SELECT 1 FROM pedidos p WHERE p.mesa_id = m.id AND p.estado = 'abierto')
          THEN 'ocupada'
          ELSE 'libre'
        END AS estado
      FROM mesas m
      ORDER BY m.numero
    `);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateMesaEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const { rowCount, rows } = await pool.query(
      'UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    if (rowCount === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};