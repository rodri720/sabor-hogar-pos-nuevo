import express from 'express';
import db from '../db/pool.js';

const router = express.Router();

router.get('/', async (req, res) => {
  const { fecha } = req.query;
  try {
    const result = db.prepare(
      `SELECT v.id, v.numero_factura, v.total, v.metodo_pago, v.fecha, m.numero AS mesa
       FROM ventas v
       JOIN mesas m ON v.mesa_id = m.id
       WHERE date(v.fecha) = ? AND v.estado = 'cerrado'
       ORDER BY v.fecha DESC`
    ).all(fecha);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;