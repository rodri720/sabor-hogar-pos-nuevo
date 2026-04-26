import pool from '../db/pool.js';
export const getCombos = async (req, res) => {
  try {
    const result = await pool.query('SELECT id, nombre, precio FROM combos WHERE activo = true ORDER BY nombre');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};