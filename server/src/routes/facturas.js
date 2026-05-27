import express from 'express';
import pool from '../db/pool.js';

const router = express.Router();

// GET /api/facturas?fecha=YYYY-MM-DD
router.get('/', async (req, res) => {
  const { fecha } = req.query;
  try {
    let query = 'SELECT * FROM facturas ORDER BY fecha DESC';
    let params = [];
    if (fecha) {
      query = 'SELECT * FROM facturas WHERE DATE(created_at) = $1 ORDER BY fecha DESC';
      params = [fecha];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/facturas/reemitir (reenviar facturas del día a ARCA)
router.post('/reemitir', async (req, res) => {
  const { fecha } = req.body;
  if (!fecha) return res.status(400).json({ error: 'Se requiere fecha' });
  try {
    const { rows: facturas } = await pool.query(
      'SELECT * FROM facturas WHERE DATE(created_at) = $1',
      [fecha]
    );
    if (facturas.length === 0) {
      return res.json({ message: 'No hay facturas para esa fecha' });
    }
    // Aquí iría la lógica de reenvío a ARCA
    // Por ahora solo simulamos
    console.log(`Reenviando ${facturas.length} facturas a ARCA...`);
    // Por cada factura, llamar a crearFacturaAFIP nuevamente (con los mismos datos)
    // Pero cuidado: no deberías duplicar facturas. Sería solo para casos de contingencia.
    res.json({ message: `Reenvío iniciado para ${facturas.length} facturas` });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

export default router;