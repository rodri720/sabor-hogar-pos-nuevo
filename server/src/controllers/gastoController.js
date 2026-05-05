import db from '../db/pool.js';

export const getGastos = async (req, res) => {
  const { fecha } = req.query;
  try {
    const result = db.prepare('SELECT * FROM gastos WHERE fecha = ? ORDER BY id DESC').all(fecha);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const createGasto = async (req, res) => {
  const { concepto, monto, categoria, fecha } = req.body;
  try {
    const result = db.prepare(
      'INSERT INTO gastos (concepto, monto, categoria, fecha) VALUES (?, ?, ?, ?) RETURNING *'
    ).get(concepto, monto, categoria, fecha);
    res.status(201).json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};