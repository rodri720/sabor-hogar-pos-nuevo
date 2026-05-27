import pool from './pool.js';

export async function getGastos(fecha) {
  const { rows } = await pool.query('SELECT * FROM gastos WHERE fecha = $1', [fecha]);
  return rows;
}

export async function crearGasto(gasto) {
  const { concepto, monto, categoria, fecha } = gasto;
  const { rows } = await pool.query(
    'INSERT INTO gastos (concepto, monto, categoria, fecha) VALUES ($1, $2, $3, $4) RETURNING *',
    [concepto, monto, categoria, fecha]
  );
  return rows[0];
}