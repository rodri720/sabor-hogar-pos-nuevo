import db from './src/db/pool.js';

try {
  const insert = db.prepare(`
    INSERT INTO titulares 
    (nombre, razon_social, cuit, direccion, barrio, localidad, condicion_iva, iibb, ingresos_brutos, inicio_actividades, punto_venta, activo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  insert.run(
    'SABOR HOGAR',
    'ROSSI KATERINNE MICAELA SOLANGE',
    '27-38413270-2',
    'VIEYTES 1527',
    'BARRIO AVENIDA',
    'Córdoba (CP 5010)',
    '020 - MONOTRIBUTO',
    'No alcanzado',
    '289549722',
    '01/07/2022',
    '00001',
    1
  );
  console.log('✅ Titular insertado correctamente');
} catch (error) {
  console.error('❌ Error al insertar titular:', error.message);
}