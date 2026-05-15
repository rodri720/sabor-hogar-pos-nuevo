import db from '../db/pool.js';

export const getMozos = (req, res) => {
  try {
    const mozos = db.prepare('SELECT id, nombre FROM mozos WHERE activo = 1 ORDER BY nombre').all();
    res.json(mozos);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};