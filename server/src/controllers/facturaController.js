import pool from '../db/pool.js';

export const getFacturas = async (req, res) => {
  const { fecha } = req.query;
  try {
    let query = 'SELECT * FROM facturas ORDER BY created_at DESC';
    let params = [];
    if (fecha) {
      query = 'SELECT * FROM facturas WHERE DATE(created_at) = $1 ORDER BY created_at DESC';
      params = [fecha];
    }
    const { rows } = await pool.query(query, params);
    res.json(rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

export const reemitirFacturas = async (req, res) => {
  const { fecha } = req.body;
  if (!fecha) return res.status(400).json({ error: 'Se requiere fecha' });
  try {
    const { rows: facturas } = await pool.query(
      'SELECT * FROM facturas WHERE DATE(created_at) = $1',
      [fecha]
    );
    if (facturas.length === 0) {
      return res.json({ message: 'No hay facturas para esa fecha', facturas: [] });
    }
    // Aquí iría la lógica real de reenvío a ARCA
    res.json({
      message: `Reenvío simulado para ${facturas.length} facturas`,
      facturas: facturas.map(f => ({ numero: f.numero, cae: f.cae, total: f.total }))
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};