import db from '../db/pool.js';

try {
  console.log("🧹 limpiando TODO...");

  db.exec('DELETE FROM pedido_detalle');
  db.exec('DELETE FROM pedidos');
  db.exec('DELETE FROM mesas');

  const insert = db.prepare(`
    INSERT INTO mesas (id, numero, estado)
    VALUES (?, ?, ?)
  `);

  insert.run(1, 1, 'libre');
  insert.run(2, 2, 'libre');
  insert.run(3, 3, 'libre');
  insert.run(4, 4, 'libre');

  console.log("✅ mesas recreadas correctamente");

} catch (err) {
  console.error(err);
}