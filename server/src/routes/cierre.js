import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/cierre?fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  try {
    const { fecha } = req.query;
    if (!fecha) {
      return res.status(400).json({ error: 'Se requiere parámetro fecha' });
    }

    // Intentar obtener de la tabla cierre_caja si ya existe
    let { rows } = await pool.query('SELECT * FROM cierre_caja WHERE fecha = $1', [fecha]);
    if (rows.length > 0) {
      return res.json(rows[0]);
    }

    // Si no existe, calcular en vivo
    const ventasRes = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as total_ventas
       FROM ventas WHERE DATE(fecha) = $1`,
      [fecha]
    );
    const gastosRes = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) as total_gastos
       FROM gastos WHERE fecha = $1`,
      [fecha]
    );

    const total_ventas = parseFloat(ventasRes.rows[0].total_ventas);
    const total_gastos = parseFloat(gastosRes.rows[0].total_gastos);
    const ganancia_neta = total_ventas - total_gastos;

    const cierre = { fecha, total_ventas, total_gastos, ganancia_neta };

    // Opcional: guardar en cierre_caja para próximas consultas
    await pool.query(
      `INSERT INTO cierre_caja (fecha, total_ventas, total_gastos, ganancia_neta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (fecha) DO UPDATE SET
         total_ventas = EXCLUDED.total_ventas,
         total_gastos = EXCLUDED.total_gastos,
         ganancia_neta = EXCLUDED.ganancia_neta`,
      [fecha, total_ventas, total_gastos, ganancia_neta]
    );

    res.json(cierre);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al obtener cierre diario' });
  }
});

// POST /api/cierre (forzar recalculo o guardar manual)
router.post('/', async (req, res) => {
  try {
    const { fecha, total_ventas, total_gastos, ganancia_neta } = req.body;
    const { rows } = await pool.query(
      `INSERT INTO cierre_caja (fecha, total_ventas, total_gastos, ganancia_neta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (fecha) DO UPDATE SET
         total_ventas = EXCLUDED.total_ventas,
         total_gastos = EXCLUDED.total_gastos,
         ganancia_neta = EXCLUDED.ganancia_neta
       RETURNING *`,
      [fecha, total_ventas, total_gastos, ganancia_neta]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Error al guardar cierre' });
  }
});

export default router;