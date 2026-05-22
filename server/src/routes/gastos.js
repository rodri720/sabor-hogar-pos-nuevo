import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/gastos?fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    const { rows } = await pool.query('SELECT * FROM gastos WHERE fecha = $1 ORDER BY id DESC', [fecha]);
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener gastos' });
  }
});

// POST /api/gastos
router.post('/', async (req, res) => {
  try {
    const { concepto, monto, categoria, fecha } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO gastos (concepto, monto, categoria, fecha)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [concepto, monto, categoria, fecha]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al crear gasto' });
  }
});

// PUT /api/gastos/:id (opcional)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { concepto, monto, categoria, fecha } = req.body;
    const { rows } = await pool.query(
      `UPDATE gastos SET concepto=$1, monto=$2, categoria=$3, fecha=$4
       WHERE id=$5 RETURNING *`,
      [concepto, monto, categoria, fecha, id]
    );
    if (rows.length === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al actualizar gasto' });
  }
});

// DELETE /api/gastos/:id
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { rowCount } = await pool.query('DELETE FROM gastos WHERE id=$1', [id]);
    if (rowCount === 0) return res.status(404).json({ error: 'Gasto no encontrado' });
    res.status(204).send();
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al eliminar gasto' });
  }
});

export default router;