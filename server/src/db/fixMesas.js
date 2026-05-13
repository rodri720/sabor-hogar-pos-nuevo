import db from './pool.js';

try {
  console.log("🧹 limpiando base...");

  // 🔥 ORDEN CORRECTO (IMPORTANTE)
  db.prepare('DELETE FROM pedido_detalle').run();
  db.prepare('DELETE FROM pedidos').run();
  db.prepare('DELETE FROM mesas').run();

  console.log("✅ datos viejos eliminados");

  // ✅ crear mesas nuevas
  const insertar = db.prepare('INSERT INTO mesas (numero, estado) VALUES (?, ?)');

  insertar.run(1, 'libre');
  insertar.run(2, 'libre');
  insertar.run(3, 'libre');
  insertar.run(4, 'libre');

  console.log("✅ mesas recreadas correctamente");

} catch (error) {
  console.error("🔥 ERROR:", error);
}