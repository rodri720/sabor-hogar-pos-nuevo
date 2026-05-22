import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET todos los mozos
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mozos ORDER BY nombre');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mozos' });
  }
});

// POST crear mozo
router.post('/', async (req, res) => {
  try {
    const { nombre, activo } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO mozos (nombre, activo) VALUES ($1, $2) RETURNING *',
      [nombre, activo !== undefined ? activo : true]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear mozo' });
  }
});

// PUT actualizar mozo
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, activo } = req.body;
    const { rows } = await pool.query(
      'UPDATE mozos SET nombre=$1, activo=$2 WHERE id=$3 RETURNING *',
      [nombre, activo, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Mozo no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar mozo' });
  }
});

// DELETE mozo (borrado lógico)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('UPDATE mozos SET activo=false WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Mozo no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar mozo' });
  }
});

export default router;