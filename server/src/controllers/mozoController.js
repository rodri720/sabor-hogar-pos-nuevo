import pool from '../db/pool.js';
export const getMozos = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, codigo FROM mozos WHERE activo = true ORDER BY codigo');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};