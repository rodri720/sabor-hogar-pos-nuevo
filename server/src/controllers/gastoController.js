import pool from '../db/pool.js';

export const getGastos = async (req, res) => {
  const { fecha } = req.query;
  try {
    const { rows } = await pool.query(
      'SELECT * FROM gastos WHERE fecha = $1 ORDER BY id DESC',
      [fecha]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const createGasto = async (req, res) => {
  const { concepto, monto, categoria, fecha } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO gastos (concepto, monto, categoria, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
      [concepto, monto, categoria, fecha]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};