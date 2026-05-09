import db from './pool.js'

// Crear tabla si no existe
export function crearTablaPuntosVenta() {
  const query = `
    CREATE TABLE IF NOT EXISTS puntos_venta (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      numero INTEGER NOT NULL,
      descripcion TEXT,
      activo INTEGER DEFAULT 1,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `
 return db.exec(query)
}

// Obtener todos los puntos de venta
export function obtenerPuntosVenta() {
  return db.all(`SELECT * FROM puntos_venta WHERE activo = 1`)
}

// Obtener uno por número
export function obtenerPorNumero(numero) {
  return db.get(`SELECT * FROM puntos_venta WHERE numero = ?`, [numero])
}

// Crear uno nuevo
export function crearPuntoVenta({ numero, descripcion }) {
  const query = `
    INSERT INTO puntos_venta (numero, descripcion)
    VALUES (?, ?)
  `
  return db.run(query, [numero, descripcion])
}

// Desactivar punto de venta
export function desactivarPuntoVenta(id) {
  return db.run(`UPDATE puntos_venta SET activo = 0 WHERE id = ?`, [id])
}