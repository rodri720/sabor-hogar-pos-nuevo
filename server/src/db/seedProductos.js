import db from '../db/pool.js';

try {
  console.log("🧹 limpiando productos...");

  db.prepare('DELETE FROM productos').run();

  const insert = db.prepare(
    'INSERT INTO productos (nombre, precio) VALUES (?, ?)'
  );

  insert.run('Café chico', 10.5);
  insert.run('Café grande', 14);
  insert.run('Capuchino', 15);
  insert.run('Té', 8);
  insert.run('Medialuna', 6);

  console.log("✅ productos cargados");

} catch (error) {
  console.error(error);
}