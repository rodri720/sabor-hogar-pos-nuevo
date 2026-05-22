import pool from '../db/pool.js';

// Obtener todos los combos activos
export const getCombos = async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT id, nombre, precio FROM combos WHERE activo = true ORDER BY nombre'
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Obtener un combo por ID
export const getComboById = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows } = await pool.query('SELECT * FROM combos WHERE id = $1', [id]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Crear un nuevo combo
export const createCombo = async (req, res) => {
  const { nombre, precio, productos_ids } = req.body;
  try {
    const { rows } = await pool.query(
      `INSERT INTO combos (nombre, precio, productos_ids, activo)
       VALUES ($1, $2, $3, true)
       RETURNING *`,
      [nombre, precio, productos_ids || []]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un combo
export const updateCombo = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, productos_ids, activo } = req.body;
  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE combos
       SET nombre = $1, precio = $2, productos_ids = $3, activo = $4
       WHERE id = $5
       RETURNING *`,
      [nombre, precio, productos_ids, activo, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Eliminar combo (borrado lógico)
export const deleteCombo = async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query(
      'UPDATE combos SET activo = false WHERE id = $1',
      [id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ error: 'Combo no encontrado' });
    }
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};