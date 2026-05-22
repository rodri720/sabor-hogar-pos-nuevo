import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/productos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// POST /api/productos
router.post('/', async (req, res) => {
  try {
    const { nombre, precio, categoria } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO productos (nombre, precio, categoria) VALUES ($1, $2, $3) RETURNING *`,
      [nombre, precio, categoria]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear producto' });
  }
});

// PUT /api/productos/:id
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, precio, categoria, activo } = req.body;
    const { rows } = await pool.query(
      `UPDATE productos SET nombre=$1, precio=$2, categoria=$3, activo=$4 WHERE id=$5 RETURNING *`,
      [nombre, precio, categoria, activo, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
});

// DELETE /api/productos/:id (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('UPDATE productos SET activo=false WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Producto no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
});

export default router;