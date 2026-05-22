import pool from '../db/pool.js';

export const getCierreDiario = async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) {
    return res.status(400).json({ error: 'La fecha es requerida' });
  }

  try {
    // Obtener total de ventas cerradas en la fecha (de la tabla pedidos)
    const { rows: ventasRows } = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as total_ventas
       FROM pedidos
       WHERE DATE(fecha) = $1 AND estado = 'cerrado'`,
      [fecha]
    );
    const totalVentas = parseFloat(ventasRows[0].total_ventas);

    // Obtener total de gastos en la fecha
    const { rows: gastosRows } = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) as total_gastos
       FROM gastos
       WHERE fecha = $1`,
      [fecha]
    );
    const totalGastos = parseFloat(gastosRows[0].total_gastos);
    const gananciaNeta = totalVentas - totalGastos;

    // Guardar o actualizar el cierre en la tabla cierre_caja
    await pool.query(
      `INSERT INTO cierre_caja (fecha, total_ventas, total_gastos, ganancia_neta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (fecha) DO UPDATE SET
         total_ventas = EXCLUDED.total_ventas,
         total_gastos = EXCLUDED.total_gastos,
         ganancia_neta = EXCLUDED.ganancia_neta`,
      [fecha, totalVentas, totalGastos, gananciaNeta]
    );

    res.json({
      total_ventas: totalVentas,
      total_gastos: totalGastos,
      ganancia_neta: gananciaNeta
    });
  } catch (error) {
    console.error('Error en getCierreDiario:', error);
    res.status(500).json({ error: error.message });
  }
};