import pool from './src/db/pool.js'; // o la ruta donde hayas definido el pool

const test = async () => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    console.log('✅ Conexión exitosa a Neon:', rows[0].now);
  } catch (err) {
    console.error('❌ Error de conexión:', err.message);
  } finally {
    await pool.end();
  }
};
test();