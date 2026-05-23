import pool from '../db/pool.js';

export const getInsumos = async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM insumos WHERE activo = true ORDER BY nombre');
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const createInsumo = async (req, res) => {
  const { nombre, cantidad, umbral, unidad } = req.body;
  try {
    const { rows } = await pool.query(
      'INSERT INTO insumos (nombre, cantidad, umbral, unidad, activo) VALUES ($1, $2, $3, $4, true) RETURNING *',
      [nombre, cantidad, umbral, unidad]
    );
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const updateInsumo = async (req, res) => {
  const { id } = req.params;
  const { nombre, cantidad, umbral, unidad, activo } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE insumos SET nombre=$1, cantidad=$2, umbral=$3, unidad=$4, activo=$5 WHERE id=$6 RETURNING *',
      [nombre, cantidad, umbral, unidad, activo, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteInsumo = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query('UPDATE insumos SET activo = false WHERE id = $1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.status(204).send();
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const reponerInsumo = async (req, res) => {
  const { id } = req.params;
  const { cantidad } = req.body;
  try {
    const { rows } = await pool.query(
      'UPDATE insumos SET cantidad = cantidad + $1 WHERE id = $2 AND activo = true RETURNING *',
      [cantidad, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Insumo no encontrado' });
    res.json(rows[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};