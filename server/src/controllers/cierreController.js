import pool from '../db/pool.js';

const HORAS_CORTE = parseInt(process.env.REPORTE_HORAS_CORTE) || 0;

export const getCierreDiario = async (req, res) => {
  const { fecha } = req.query;
  if (!fecha) return res.status(400).json({ error: 'La fecha es requerida' });

  try {
    // Ventas con desplazamiento de horas
    const { rows: ventasRows } = await pool.query(
      `SELECT COALESCE(SUM(total), 0) as total_ventas
       FROM pedidos
       WHERE ( (fecha - ($2 || ' hours')::interval) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires' )::DATE = $1
       AND estado = 'cerrado'`,
      [fecha, HORAS_CORTE]
    );
    const totalVentas = parseFloat(ventasRows[0].total_ventas);

    // Gastos con mismo desplazamiento
    const { rows: gastosRows } = await pool.query(
      `SELECT COALESCE(SUM(monto), 0) as total_gastos
       FROM gastos
       WHERE ( (fecha - ($2 || ' hours')::interval) AT TIME ZONE 'UTC' AT TIME ZONE 'America/Argentina/Buenos_Aires' )::DATE = $1`,
      [fecha, HORAS_CORTE]
    );
    const totalGastos = parseFloat(gastosRows[0].total_gastos);
    const gananciaNeta = totalVentas - totalGastos;

    await pool.query(
      `INSERT INTO cierre_caja (fecha, total_ventas, total_gastos, ganancia_neta)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (fecha) DO UPDATE SET
         total_ventas = EXCLUDED.total_ventas,
         total_gastos = EXCLUDED.total_gastos,
         ganancia_neta = EXCLUDED.ganancia_neta`,
      [fecha, totalVentas, totalGastos, gananciaNeta]
    );

    res.json({ total_ventas: totalVentas, total_gastos: totalGastos, ganancia_neta: gananciaNeta });
  } catch (error) {
    console.error('Error en getCierreDiario:', error);
    res.status(500).json({ error: error.message });
  }
};