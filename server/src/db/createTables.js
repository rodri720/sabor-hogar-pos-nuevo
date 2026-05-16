import db from './pool.js';
import { crearTablaPuntosVenta } from './puntoventa.js';

export async function crearTablas() {
  // Tabla mesas
  db.exec(`
    CREATE TABLE IF NOT EXISTS mesas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER UNIQUE NOT NULL,
      estado TEXT NOT NULL DEFAULT 'libre'
    );
  `);

  // Tabla productos
  db.exec(`
    CREATE TABLE IF NOT EXISTS productos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      categoria TEXT,
      activo INTEGER DEFAULT 1
    );
  `);

  // Tabla pedidos (sin mozo aún)
  db.exec(`
    CREATE TABLE IF NOT EXISTS pedidos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      mesa_id INTEGER REFERENCES mesas(id),
      estado TEXT NOT NULL,
      total REAL DEFAULT 0,
      factura_numero INTEGER,
      cae TEXT,
      cae_vto TEXT,
      metodo_pago TEXT
    );
  `);

  // Tabla pedido_detalle
  db.exec(`
    CREATE TABLE IF NOT EXISTS pedido_detalle (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      pedido_id INTEGER REFERENCES pedidos(id),
      producto_id INTEGER REFERENCES productos(id),
      cantidad INTEGER NOT NULL,
      precio_unitario REAL NOT NULL,
      subtotal REAL NOT NULL
    );
  `);

  // Tabla gastos
  db.exec(`
    CREATE TABLE IF NOT EXISTS gastos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      concepto TEXT NOT NULL,
      monto REAL NOT NULL,
      categoria TEXT,
      fecha TEXT NOT NULL
    );
  `);

  // Tabla cierre_caja
  db.exec(`
    CREATE TABLE IF NOT EXISTS cierre_caja (
      fecha TEXT PRIMARY KEY,
      total_ventas REAL,
      total_gastos REAL
    );
  `);

  // Tabla mozos
  db.exec(`
    CREATE TABLE IF NOT EXISTS mozos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      codigo TEXT NOT NULL,
      activo INTEGER DEFAULT 1
    );
  `);

  // Tabla combos
  db.exec(`
    CREATE TABLE IF NOT EXISTS combos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      precio REAL NOT NULL,
      activo INTEGER DEFAULT 1
    );
  `);

  // Tabla ventas
  db.exec(`
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

  // Tabla titulares (para los dos responsables)
  db.exec(`
    CREATE TABLE IF NOT EXISTS titulares (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nombre TEXT NOT NULL,
      razon_social TEXT,
      cuit TEXT NOT NULL,
      direccion TEXT,
      localidad TEXT,
      condicion_iva TEXT,
      iibb TEXT,
      inicio_actividades TEXT,
      punto_venta TEXT,
      activo INTEGER DEFAULT 1
    );
  `);

  // Agregar columna mozo a pedidos si no existe
  const pedidoCols = db.prepare(`PRAGMA table_info(pedidos)`).all();
  const tieneMozo = pedidoCols.some(c => c.name === 'mozo');
  if (!tieneMozo) {
    db.exec(`ALTER TABLE pedidos ADD COLUMN mozo INTEGER`);
  }

  // Crear tabla punto de venta (si existe la función)
  if (typeof crearTablaPuntosVenta === 'function') {
    await crearTablaPuntosVenta();
  }

  console.log('✅ Tablas creadas/verificadas correctamente');
}