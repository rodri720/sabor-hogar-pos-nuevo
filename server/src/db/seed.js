import db from './pool.js';

try {
  // Insertar mesa (si no existe)
  const mesa = db.prepare('SELECT id FROM mesas WHERE numero = ?').get(1);
  if (!mesa) {
    const insertMesa = db.prepare('INSERT INTO mesas (numero, estado) VALUES (?, ?)');
    insertMesa.run(1, 'libre');
    console.log('✅ Mesa 1 creada');
  } else {
    console.log('ℹ️ La mesa 1 ya existe');
  }

  // Insertar producto de prueba (si no existe)
  const producto = db.prepare('SELECT id FROM productos WHERE nombre = ?').get('Producto de prueba');
  if (!producto) {
    const insertProducto = db.prepare('INSERT INTO productos (nombre, precio, categoria, activo) VALUES (?, ?, ?, ?)');
    insertProducto.run('Producto de prueba', 10.5, 'Bebida', 1);
    console.log('✅ Producto de prueba creado');
  } else {
    console.log('ℹ️ El producto ya existe');
  }

  console.log('🎉 Datos de prueba listos');
} catch (error) {
  console.error('❌ Error:', error.message);
}