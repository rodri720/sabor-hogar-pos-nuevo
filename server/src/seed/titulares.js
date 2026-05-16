import db from '../db/pool.js';

try {
  console.log("🧹 Limpiando titulares antiguos...");
  db.prepare('DELETE FROM titulares').run();

  const insert = db.prepare(`
    INSERT INTO titulares (nombre, razon_social, cuit, direccion, localidad, condicion_iva, iibb, inicio_actividades, punto_venta, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  insert.run(
    'Sabor Hogar - Katerinne',
    'ROSSI KATERINNE MICAELA SOLANGE',
    '27-38413270-2',
    'VIEYTES 1527, BARRIO AVENIDA',
    'Córdoba (CP 5010)',
    '020 - MONOTRIBUTO',
    'No alcanzado',
    '01/07/2022',
    '0003',
    1
  );

  insert.run(
    'Sabor Hogar - Maria',
    'TORRES MARIA ALEJANDRA',
    '27-21983808-0',
    'MISMA DIRECCION',
    'Córdoba (CP 5010)',
    '020 - MONOTRIBUTO',
    'No alcanzado',
    '01/01/2023',
    '0004',
    1
  );

  console.log("✅ Titulares actualizados: solo Katerinne y Maria");
} catch (error) {
  console.error("❌ Error al sembrar titulares:", error);
}
