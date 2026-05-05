import db from '../db/pool.js';

export const getMozos = async (req, res) => {
  try {
    const result = db.prepare('SELECT id, nombre, codigo FROM mozos WHERE activo = 1 ORDER BY codigo').all();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};