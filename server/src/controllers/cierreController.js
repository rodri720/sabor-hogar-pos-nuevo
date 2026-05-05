import db from '../db/pool.js';

export const getCierreDiario = async (req, res) => {
  const { fecha } = req.query;
  try {
    const ventas = db.prepare(
      `SELECT IFNULL(SUM(total), 0) as total_ventas 
       FROM pedidos 
       WHERE date(fecha) = ? AND estado = 'cerrado'`
    ).get(fecha);
    const gastos = db.prepare(
      `SELECT IFNULL(SUM(monto), 0) as total_gastos 
       FROM gastos 
       WHERE fecha = ?`
    ).get(fecha);
    const total_ventas = parseFloat(ventas.total_ventas);
    const total_gastos = parseFloat(gastos.total_gastos);
    const ganancia_neta = total_ventas - total_gastos;

    const insert = db.prepare(
      `INSERT OR REPLACE INTO cierre_caja (fecha, total_ventas, total_gastos) 
       VALUES (?, ?, ?)`
    );
    insert.run(fecha, total_ventas, total_gastos);

    res.json({ total_ventas, total_gastos, ganancia_neta });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};