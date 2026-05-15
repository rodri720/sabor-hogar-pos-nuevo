import db from '../db/pool.js';

try {
  console.log("🔓 Desactivando restricciones FK...");
  db.exec('PRAGMA foreign_keys = OFF;');

  console.log("🧹 Limpiando datos antiguos...");

  // Tablas con dependencias (orden inverso)
  db.prepare('DELETE FROM pedido_detalle').run();
  db.prepare('DELETE FROM pedidos').run();
  db.prepare('DELETE FROM ventas').run();   // si tiene mesa_id
  db.prepare('DELETE FROM mesas').run();

  console.log("✅ Datos eliminados");

  console.log("🪑 Insertando 15 mesas...");
  const insert = db.prepare('INSERT INTO mesas (numero, estado) VALUES (?, ?)');
  for (let i = 1; i <= 15; i++) {
    insert.run(i, 'libre');
  }

  console.log("✅ 15 mesas creadas");

  console.log("🔒 Reactivando restricciones FK...");
  db.exec('PRAGMA foreign_keys = ON;');

} catch (error) {
  console.error("❌ Error al resetear mesas:", error);
  // Asegurar que se vuelvan a activar las FK
  try { db.exec('PRAGMA foreign_keys = ON;'); } catch(e) {}
}