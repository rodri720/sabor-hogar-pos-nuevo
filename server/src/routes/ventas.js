router.get('/', async (req, res) => {
  const { fecha } = req.query;
  try {
    const result = await pool.query(
      `SELECT v.id, v.numero_factura, v.total, v.metodo_pago, v.fecha, m.numero as mesa
       FROM ventas v
       JOIN mesas m ON v.mesa_id = m.id
       WHERE DATE(v.fecha) = $1 AND v.estado = 'cerrado'
       ORDER BY v.fecha DESC`,
      [fecha]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});