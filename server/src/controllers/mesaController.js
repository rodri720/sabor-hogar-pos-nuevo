import pool from '../db/pool.js';

export const getMesas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM mesas ORDER BY numero');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMesaEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // 'libre', 'ocupada', 'pagando'
  try {
    const result = await pool.query(
      'UPDATE mesas SET estado = $1 WHERE id = $2 RETURNING *',
      [estado, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};