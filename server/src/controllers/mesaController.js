import db from '../db/pool.js';

export const getMesas = async (req, res) => {
  try {
    const result = db.prepare('SELECT * FROM mesas ORDER BY numero').all();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateMesaEstado = async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body;
  try {
    const info = db
      .prepare('UPDATE mesas SET estado = ? WHERE id = ?')
      .run(estado, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Mesa no encontrada' });
    }

    const result = db.prepare('SELECT * FROM mesas WHERE id = ?').get(id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};