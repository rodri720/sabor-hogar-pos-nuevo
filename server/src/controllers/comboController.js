import db from '../db/pool.js';

export const getCombos = async (req, res) => {
  try {
    const result = db.prepare('SELECT id, nombre, precio FROM combos WHERE activo = 1 ORDER BY nombre').all();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};