import pool from './pool.js';

export async function crearTablas() {
  try {
    // 1. Tabla de ventas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS ventas (
        id SERIAL PRIMARY KEY,
        numero_factura INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        metodo_pago VARCHAR(50) NOT NULL,
        fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        hora TIME DEFAULT CURRENT_TIME
      )
    `);

    // 2. Tabla de gastos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS gastos (
        id SERIAL PRIMARY KEY,
        concepto VARCHAR(255) NOT NULL,
        monto DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(100) NOT NULL,
        fecha DATE NOT NULL
      )
    `);

    // 3. Tabla de cierre de caja
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cierre_caja (
        id SERIAL PRIMARY KEY,
        fecha DATE NOT NULL UNIQUE,
        total_ventas DECIMAL(10,2) NOT NULL,
        total_gastos DECIMAL(10,2) NOT NULL,
        ganancia_neta DECIMAL(10,2) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Tabla de productos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS productos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        categoria VARCHAR(100),
        activo BOOLEAN DEFAULT TRUE
      )
    `);

    // 5. Tabla de mesas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mesas (
        id SERIAL PRIMARY KEY,
        numero INTEGER NOT NULL UNIQUE,
        capacidad INTEGER,
        estado VARCHAR(50) DEFAULT 'libre'
      )
    `);

    // 6. Tabla de mozos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mozos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        activo BOOLEAN DEFAULT TRUE
      )
    `);

    // 7. Tabla de combos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS combos (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        precio DECIMAL(10,2) NOT NULL,
        productos_ids INTEGER[]  -- array de IDs de productos
      )
    `);

    // 8. Tabla de titulares (para facturación)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS titulares (
        id SERIAL PRIMARY KEY,
        nombre VARCHAR(255) NOT NULL,
        documento VARCHAR(50),
        telefono VARCHAR(50)
      )
    `);

    // 9. Tabla de pedidos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedidos (
        id SERIAL PRIMARY KEY,
        mesa_id INTEGER REFERENCES mesas(id) ON DELETE SET NULL,
        mozo_id INTEGER REFERENCES mozos(id) ON DELETE SET NULL,
        fecha TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
        total DECIMAL(10,2),
        estado VARCHAR(50)
      )
    `);

    // 10. Tabla de detalles de pedido (si la usas, añádela)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS pedido_detalles (
        id SERIAL PRIMARY KEY,
        pedido_id INTEGER REFERENCES pedidos(id) ON DELETE CASCADE,
        producto_id INTEGER REFERENCES productos(id),
        cantidad INTEGER NOT NULL,
        precio_unitario DECIMAL(10,2)
      )
    `);

    console.log('✅ Tablas creadas/verificadas en Neon');
  } catch (error) {
    console.error('❌ Error creando tablas:', error.message);
    throw error;
  }
}