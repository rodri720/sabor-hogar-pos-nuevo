import pool from '../db/pool.js';

export const getTitulares = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM titulares WHERE activo = true ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createTitular = async (req, res) => {
  const { nombre, documento, telefono } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO titulares (nombre, documento, telefono, activo) VALUES ($1, $2, $3, true) RETURNING *`,
      [nombre, documento, telefono]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateTitular = async (req, res) => {
  const { id } = req.params;
  const { nombre, documento, telefono, activo } = req.body;
  try {
    const { rows } = await pool.query(
      `UPDATE titulares SET nombre=$1, documento=$2, telefono=$3, activo=$4 WHERE id=$5 RETURNING *`,
      [nombre, documento, telefono, activo, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Titular no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTitular = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('UPDATE titulares SET activo = false WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Titular no encontrado' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};