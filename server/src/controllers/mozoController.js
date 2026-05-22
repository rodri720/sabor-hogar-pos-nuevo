import pool from '../db/pool.js';

export const getMozos = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre FROM mozos WHERE activo = true ORDER BY nombre'
    );
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};