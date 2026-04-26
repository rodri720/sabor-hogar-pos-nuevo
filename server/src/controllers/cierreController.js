import pool from '../db/pool.js';

export const getCierreDiario = async (req, res) => {
  const { fecha } = req.query;
  try {
    // Corregir: usar comillas invertidas para template literal o escapar comillas simples
    const ventas = await pool.query(
      `SELECT COALESCE(SUM(total),0) as total_ventas 
       FROM ventas 
       WHERE DATE(fecha) = $1 AND estado = 'cerrado'`,
      [fecha]
    );
    const gastos = await pool.query(
      `SELECT COALESCE(SUM(monto),0) as total_gastos 
       FROM gastos 
       WHERE fecha = $1`,
      [fecha]
    );
    const total_ventas = parseFloat(ventas.rows[0].total_ventas);
    const total_gastos = parseFloat(gastos.rows[0].total_gastos);
    const ganancia_neta = total_ventas - total_gastos;

    await pool.query(
      `INSERT INTO cierre_caja (fecha, total_ventas, total_gastos) 
       VALUES ($1, $2, $3)
       ON CONFLICT (fecha) DO UPDATE 
       SET total_ventas = EXCLUDED.total_ventas, 
           total_gastos = EXCLUDED.total_gastos`,
      [fecha, total_ventas, total_gastos]
    );

    res.json({ total_ventas, total_gastos, ganancia_neta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};