import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();
const HORAS_CORTE = parseInt(process.env.REPORTE_HORAS_CORTE) || 0; // desde .env

// GET /api/ventas?fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ error: 'Se requiere parámetro fecha' });
    }

    // Ventas del día según Argentina, aplicando desplazamiento de horas de corte
    const { rows } = await pool.query(
      `SELECT 
        v.*,
        ( (v.fecha - ($1 || ' hours')::interval) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires' ) as fecha_local
       FROM ventas v
       WHERE ( (v.fecha - ($1 || ' hours')::interval) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires' )::DATE = $2
       ORDER BY v.fecha DESC`,
      [HORAS_CORTE, fecha]
    );

    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener ventas' });
  }
});

// POST /api/ventas (sin cambios)
router.post('/', async (req, res) => {
  try {
    const { numero_factura, total, metodo_pago, fecha, hora } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO ventas (numero_factura, total, metodo_pago, fecha, hora)
       VALUES ($1, $2, $3, COALESCE($4, CURRENT_TIMESTAMP), COALESCE($5, CURRENT_TIME))
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