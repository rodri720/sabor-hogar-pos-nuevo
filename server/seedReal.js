import pool from './src/db/pool.js';

const productos = [
  { id: 1, nombre: 'Café Chico', precio: 2700, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 10 },
  { id: 2, nombre: 'Café Jarrito', precio: 3500, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 12 },
  { id: 3, nombre: 'Café Doble', precio: 4500, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 15 },
  { id: 4, nombre: 'Capuchino Chico', precio: 4000, categoria: 'Especiales', stock: 4000, unidad: 'ml', consumoPorUnidad: 250 },
  { id: 5, nombre: 'Capuchino Grande', precio: 5000, categoria: 'Especiales', stock: 4000, unidad: 'ml', consumoPorUnidad: 350 },
  { id: 6, nombre: 'Submarino Chico', precio: 4000, categoria: 'Especiales', stock: 3000, unidad: 'ml', consumoPorUnidad: 200 },
  { id: 7, nombre: 'Submarino Grande', precio: 4800, categoria: 'Especiales', stock: 3000, unidad: 'ml', consumoPorUnidad: 300 },
  { id: 8, nombre: '2 Licuados + Tostados', precio: 13500, categoria: 'Promo', stock: 20, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 9, nombre: 'Sándwich de Miga', precio: 2500, categoria: 'Comidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 10, nombre: 'Agua saborizada Fresh', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 11, nombre: 'Agua mineral Villavicencio', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 12, nombre: 'Gaseosa Pepsi', precio: 1300, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 13, nombre: 'Gaseosa Coca-Cola', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 14, nombre: 'Fanta Naranja', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 15, nombre: 'Sprite', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 16, nombre: 'Gatorade', precio: 2400, categoria: 'Bebidas', stock: 80, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 17, nombre: 'Jugo Baggio', precio: 1000, categoria: 'Bebidas', stock: 150, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 18, nombre: 'Yogurt Mamfrey', precio: 1500, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 19, nombre: 'Yogurt Ilolay', precio: 1200, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 20, nombre: 'Yogurt La Serenísima', precio: 1200, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 21, nombre: 'Monster (amarillo)', precio: 3500, categoria: 'Bebidas', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 22, nombre: 'Alfajor de maicena', precio: 500, categoria: 'Dulces y Porciones', stock: 200, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 23, nombre: 'Porción de torta', precio: 6000, categoria: 'Dulces y Porciones', stock: 30, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 24, nombre: 'Porción de tarta', precio: 4500, categoria: 'Dulces y Porciones', stock: 30, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 25, nombre: 'Mini tarta', precio: 6000, categoria: 'Dulces y Porciones', stock: 20, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 26, nombre: 'Budín mini', precio: 2500, categoria: 'Dulces y Porciones', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 27, nombre: 'Budín', precio: 4000, categoria: 'Dulces y Porciones', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 }
];

const combos = [
  { id: 1, nombre: 'Simple', precio: 5000, productos_ids: [1,10] },
  { id: 2, nombre: 'Light', precio: 9000, productos_ids: [4,9,14] },
  { id: 3, nombre: 'Completo', precio: 7500, productos_ids: [2,9,22] },
  { id: 4, nombre: 'Campestre', precio: 10000, productos_ids: [5,9,11] },
  { id: 5, nombre: 'Fit', precio: 13000, productos_ids: [6,23,16] },
  { id: 6, nombre: 'Fit Plus', precio: 14000, productos_ids: [7,24,21] },
  { id: 7, nombre: 'Dulcero', precio: 9500, productos_ids: [22,23,26,27] }
];

const mesas = Array.from({ length: 15 }, (_, i) => ({
  id: i+1,
  numero: i+1,
  estado: i === 0 ? 'ocupada' : 'libre'
}));

const mozos = [
  { id: 1, nombre: 'Mozo 1' },
  { id: 2, nombre: 'Mozo 2' },
  { id: 3, nombre: 'Mozo 3' },
  { id: 4, nombre: 'Mozo 4' },
  { id: 5, nombre: 'Mozo 5' }
];

const insumos = [
  { id: 1, nombre: 'Café en grano', cantidad: 5000, unidad: 'gr', umbral: 1000 },
  { id: 2, nombre: 'Leche entera', cantidad: 5000, unidad: 'ml', umbral: 1000 },
  { id: 3, nombre: 'Harina', cantidad: 2000, unidad: 'gr', umbral: 500 },
  { id: 4, nombre: 'Azúcar', cantidad: 3000, unidad: 'gr', umbral: 500 },
  { id: 5, nombre: 'Jugo en polvo', cantidad: 2000, unidad: 'gr', umbral: 400 }
];

const gastos = [
  { id: 1, descripcion: 'Compra café', monto: 8000, fecha: '2025-04-30', categoria: 'insumos', turno: 'mañana' },
  { id: 2, descripcion: 'Sueldo empleados', monto: 30000, fecha: '2025-04-30', categoria: 'sueldos', turno: 'tarde' },
  { id: 3, descripcion: 'Mantenimiento máquina', monto: 5000, fecha: '2025-04-29', categoria: 'mantenimiento', turno: 'mañana' }
];

const ventas = [
  { id: 1, mesa_id: 1, mozo_id: 1, items: [{ producto_id: 1, cantidad: 2, precio_unitario: 2700 }], metodo_pago: 'efectivo', total: 5400, fecha: '2025-04-30T10:30:00', turno: 'mañana', estado: 'cerrado' },
  { id: 2, mesa_id: 2, mozo_id: 2, items: [{ producto_id: 2, cantidad: 1, precio_unitario: 3500 }], metodo_pago: 'qr', total: 3500, fecha: '2025-04-30T16:00:00', turno: 'tarde', estado: 'cerrado' },
  { id: 3, mesa_id: 1, mozo_id: 1, items: [{ combo_id: 1, cantidad: 1, precio_unitario: 5000 }], metodo_pago: 'transferencia', total: 5000, fecha: '2025-04-30T09:00:00', turno: 'mañana', estado: 'cerrado' }
];

async function seed() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // 1. Productos
    console.log('🧹 Limpiando productos...');
    await client.query('TRUNCATE TABLE productos RESTART IDENTITY CASCADE');
    console.log('🌱 Insertando productos...');
    for (const p of productos) {
      await client.query(`
        INSERT INTO productos (id, nombre, precio, categoria, stock, unidad, consumo_por_unidad, activo)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true)
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          precio = EXCLUDED.precio,
          categoria = EXCLUDED.categoria,
          stock = EXCLUDED.stock,
          unidad = EXCLUDED.unidad,
          consumo_por_unidad = EXCLUDED.consumo_por_unidad,
          activo = true
      `, [p.id, p.nombre, p.precio, p.categoria, p.stock, p.unidad, p.consumoPorUnidad]);
    }

    // 2. Combos
    console.log('🍽️ Insertando combos...');
    await client.query('TRUNCATE TABLE combos RESTART IDENTITY CASCADE');
    for (const c of combos) {
      await client.query(`
        INSERT INTO combos (id, nombre, precio, productos_ids, activo)
        VALUES ($1, $2, $3, $4, true)
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          precio = EXCLUDED.precio,
          productos_ids = EXCLUDED.productos_ids,
          activo = true
      `, [c.id, c.nombre, c.precio, c.productos_ids]);
    }

    // 3. Mesas
    console.log('🍽️ Insertando mesas...');
    await client.query('TRUNCATE TABLE mesas RESTART IDENTITY CASCADE');
    for (const m of mesas) {
      await client.query(`
        INSERT INTO mesas (id, numero, estado)
        VALUES ($1, $2, $3)
        ON CONFLICT (id) DO UPDATE SET
          numero = EXCLUDED.numero,
          estado = EXCLUDED.estado
      `, [m.id, m.numero, m.estado]);
    }

    // 4. Mozos
    console.log('👨‍🍳 Insertando mozos...');
    await client.query('TRUNCATE TABLE mozos RESTART IDENTITY CASCADE');
    for (const mo of mozos) {
      await client.query(`
        INSERT INTO mozos (id, nombre, activo)
        VALUES ($1, $2, true)
        ON CONFLICT (id) DO UPDATE SET
          nombre = EXCLUDED.nombre,
          activo = true
      `, [mo.id, mo.nombre]);
    }

    // 5. Insumos (si la tabla existe)
    console.log('📦 Insertando insumos...');
    const tableCheck = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'insumos'
      );
    `);
    if (tableCheck.rows[0].exists) {
      await client.query('TRUNCATE TABLE insumos RESTART IDENTITY CASCADE');
      for (const i of insumos) {
        await client.query(`
          INSERT INTO insumos (id, nombre, cantidad, unidad, umbral, activo)
          VALUES ($1, $2, $3, $4, $5, true)
          ON CONFLICT (id) DO UPDATE SET
            nombre = EXCLUDED.nombre,
            cantidad = EXCLUDED.cantidad,
            unidad = EXCLUDED.unidad,
            umbral = EXCLUDED.umbral,
            activo = true
        `, [i.id, i.nombre, i.cantidad, i.unidad, i.umbral]);
      }
    } else {
      console.log('⚠️ Tabla insumos no existe, se omite.');
    }

    // 6. Gastos
    console.log('💸 Insertando gastos...');
    await client.query('TRUNCATE TABLE gastos RESTART IDENTITY CASCADE');
    for (const g of gastos) {
      await client.query(`
        INSERT INTO gastos (id, concepto, monto, fecha, categoria, turno)
VALUES ($1, $2, $3, $4, $5, $6)
        ON CONFLICT (id) DO UPDATE SET
          concepto = EXCLUDED.concepto,
          monto = EXCLUDED.monto,
          fecha = EXCLUDED.fecha,
          categoria = EXCLUDED.categoria,
          turno = EXCLUDED.turno
      `, [g.id, g.descripcion, g.monto, g.fecha, g.categoria, g.turno]);
    }

    // 7. Ventas (requiere pedidos y detalle, pero tu estructura es diferente. Por simplicidad, insertamos en tabla ventas existente)
    console.log('📊 Insertando ventas...');
    await client.query('TRUNCATE TABLE ventas RESTART IDENTITY CASCADE');
    for (const v of ventas) {
      // En tu tabla ventas actual (sin items detallados) insertamos solo el resumen.
      // Para guardar items necesitarías una tabla ventas_detalle. Pero como es un seed de datos de ejemplo, guardamos cabecera.
      await client.query(`
        INSERT INTO ventas (id, numero_factura, total, metodo_pago, fecha, mesa_id, estado)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT (id) DO UPDATE SET
          total = EXCLUDED.total,
          metodo_pago = EXCLUDED.metodo_pago,
          fecha = EXCLUDED.fecha,
          mesa_id = EXCLUDED.mesa_id,
          estado = EXCLUDED.estado
      `, [v.id, null, v.total, v.metodo_pago, v.fecha, v.mesa_id, v.estado]);
    }

    // Resetear secuencias
    await client.query('SELECT setval(pg_get_serial_sequence(\'productos\', \'id\'), (SELECT MAX(id) FROM productos))');
    await client.query('SELECT setval(pg_get_serial_sequence(\'combos\', \'id\'), (SELECT MAX(id) FROM combos))');
    await client.query('SELECT setval(pg_get_serial_sequence(\'mesas\', \'id\'), (SELECT MAX(id) FROM mesas))');
    await client.query('SELECT setval(pg_get_serial_sequence(\'mozos\', \'id\'), (SELECT MAX(id) FROM mozos))');
    if (tableCheck.rows[0].exists) {
      await client.query('SELECT setval(pg_get_serial_sequence(\'insumos\', \'id\'), (SELECT MAX(id) FROM insumos))');
    }
    await client.query('SELECT setval(pg_get_serial_sequence(\'gastos\', \'id\'), (SELECT MAX(id) FROM gastos))');
    await client.query('SELECT setval(pg_get_serial_sequence(\'ventas\', \'id\'), (SELECT MAX(id) FROM ventas))');

    await client.query('COMMIT');
    console.log('✅ Seed completado con éxito.');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('❌ Error en seed:', error);
  } finally {
    client.release();
    process.exit(0);
  }
}

seed();