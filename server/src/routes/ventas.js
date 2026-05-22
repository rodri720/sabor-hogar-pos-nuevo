import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/ventas?fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    const { rows } = await pool.query(
      `SELECT * FROM ventas WHERE DATE(fecha) = $1 ORDER BY fecha DESC`,
      [fecha]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// POST /api/ventas
router.post('/', async (req, res) => {
  try {
    const { numero_factura, total, metodo_pago, fecha, hora } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO ventas (numero_factura, total, metodo_pago, fecha, hora)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_DATE), COALESCE($5, CURRENT_TIME))
       RETURNING *`,
      [numero_factura, total, metodo_pago, fecha, hora]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al registrar venta' });
  }
});

export default router;