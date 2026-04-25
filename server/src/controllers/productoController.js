import pool from '../db/pool.js';

export const getProductos = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY categoria, nombre');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProducto = async (req, res) => {
  const { nombre, precio, categoria } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO productos (nombre, precio, categoria) VALUES ($1, $2, $3) RETURNING *',
      [nombre, precio, categoria]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria, activo } = req.body;
  try {
    const result = await pool.query(
      'UPDATE productos SET nombre = $1, precio = $2, categoria = $3, activo = $4 WHERE id = $5 RETURNING *',
      [nombre, precio, categoria, activo, id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE productos SET activo = false WHERE id = $1', [id]);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};