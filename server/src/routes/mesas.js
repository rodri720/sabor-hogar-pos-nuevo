import express from 'express';
import pool from '../db/pool.js';
import { liberarMesa } from '../controllers/mesaController.js';

const router = express.Router();

// GET todas las mesas
router.get('/', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM mesas ORDER BY numero');
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener mesas' });
  }
});

// Liberar mesa (eliminar pedido activo y liberar)
router.delete('/:id/liberar', liberarMesa);

// POST crear mesa
router.post('/', async (req, res) => {
  try {
    const { numero, capacidad, estado } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO mesas (numero, capacidad, estado) VALUES ($1, $2, $3) RETURNING *',
      [numero, capacidad, estado || 'libre']
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear mesa' });
  }
});

// PUT actualizar mesa
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { numero, capacidad, estado } = req.body;
    const { rows } = await pool.query(
      'UPDATE mesas SET numero=$1, capacidad=$2, estado=$3 WHERE id=$4 RETURNING *',
      [numero, capacidad, estado, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar mesa' });
  }
});

// DELETE mesa (borrado físico)
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM mesas WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Mesa no encontrada' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar mesa' });
  }
});

export default router;