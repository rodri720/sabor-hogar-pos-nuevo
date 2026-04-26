import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
dotenv.config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: 5432,
  max: 20,
  idleTimeoutMillis: 30000,
});

// Función para crear tablas si no existen
const inicializarTablas = async () => {
  const queries = `
    CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        concepto VARCHAR(255) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(100),
        fecha DATE DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS cierre_caja (
        id SERIAL PRIMARY KEY,
        fecha DATE UNIQUE NOT NULL,
        total_ventas DECIMAL(10,2) NOT NULL,
        total_gastos DECIMAL(10,2) NOT NULL,
        ganancia_neta DECIMAL(10,2) GENERATED ALWAYS AS (total_ventas - total_gastos) STORED
    );
  `;
  try {
    await pool.query(queries);
    console.log('✅ Tablas "gastos" y "cierre_caja" verificadas/creadas');
  } catch (err) {
    console.error('❌ Error al crear tablas:', err.message);
    // No relanzamos el error para que el servidor pueda seguir corriendo
    // incluso si las tablas ya existen o hay problemas de permisos
  }
};

// Verificar conexión a la base de datos sin bloquear el arranque
const verificarConexion = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('✅ Conexión a PostgreSQL exitosa');
  } catch (err) {
    console.error('❌ Error de conexión a PostgreSQL:', err.message);
  }
};

// Ejecutar ambas funciones de inicialización (no bloqueantes)
verificarConexion();
inicializarTablas();

export default pool;