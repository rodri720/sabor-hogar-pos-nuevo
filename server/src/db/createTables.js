import db from './pool.js';
import { crearTablaPuntosVenta } from './puntoventa.js';

export async function crearTablas() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS mesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      estado TEXT NOT NULL DEFAULT 'libre'
    );

    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      categoria TEXT,
      activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER REFERENCES mesas(id),
      estado TEXT NOT NULL,
      total REAL DEFAULT 0,
      factura_numero INTEGER,
      cae TEXT,
      cae_vto TEXT
    );

    CREATE TABLE IF NOT EXISTS pedido_detalle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER REFERENCES pedidos(id),
      producto_id INTEGER REFERENCES productos(id),
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL
    );

    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto TEXT NOT NULL,
      monto REAL NOT NULL,
      categoria TEXT,
      fecha TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS cierre_caja (
      fecha TEXT PRIMARY KEY,
      total_ventas REAL,
      total_gastos REAL
    );

    CREATE TABLE IF NOT EXISTS mozos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo TEXT NOT NULL,
      activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS combos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      activo INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS ventas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero_factura INTEGER,
      total REAL,
      metodo_pago TEXT,
      fecha TEXT,
      mesa_id INTEGER REFERENCES mesas(id),
      estado TEXT
    );
  `);

  const pedidoCols = db.prepare(`PRAGMA table_info(pedidos)`).all();
  const tieneMetodo = pedidoCols.some((c) => c.name === 'metodo_pago');
  if (!tieneMetodo) {
    db.exec(`ALTER TABLE pedidos ADD COLUMN metodo_pago TEXT`);
  }

  // ✅ tabla punto de venta
  await crearTablaPuntosVenta();

  console.log('✅ Tablas creadas correctamente');
}