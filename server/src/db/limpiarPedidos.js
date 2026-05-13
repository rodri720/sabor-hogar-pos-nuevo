import db from '../db/pool.js';

try {
  console.log('🧹 limpiando pedidos...');

  db.exec('DELETE FROM pedido_detalle');
  db.exec('DELETE FROM pedidos');

  console.log('✅ pedidos eliminados correctamente');

} catch (error) {
  console.error('🔥 ERROR:', error.message);
}
