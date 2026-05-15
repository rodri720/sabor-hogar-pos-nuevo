import db from '../db/pool.js';

try {
  console.log("🧹 limpiando mozos...");
  db.prepare('DELETE FROM mozos').run();

  const insert = db.prepare('INSERT INTO mozos (nombre, codigo, activo) VALUES (?, ?, ?)');

  const mozos = [
    { nombre: 'Mozo1', codigo: 'M01' },
    { nombre: 'Mozo2', codigo: 'M02' },
    { nombre: 'Mozo3', codigo: 'M03' },
    { nombre: 'Mozo4', codigo: 'M04' },
    { nombre: 'Mozo5', codigo: 'M05' },
  ];

  for (const m of mozos) {
    insert.run(m.nombre, m.codigo, 1);
  }

  console.log("✅ 5 mozos creados (activos)");
} catch (error) {
  console.error("❌ Error al sembrar mozos:", error);
}