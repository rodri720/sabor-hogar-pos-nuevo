import pool from './src/db/pool.js';

async function seed() {
  try {
    console.log('🧹 Limpiando tablas...');
    await pool.query('DELETE FROM productos');
    await pool.query('DELETE FROM mesas');
    await pool.query('DELETE FROM mozos');
    await pool.query('ALTER SEQUENCE productos_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE mesas_id_seq RESTART WITH 1');
    await pool.query('ALTER SEQUENCE mozos_id_seq RESTART WITH 1');

    console.log('🌱 Insertando productos...');
    const productos = [
      ['Café Chico', 2700, 'Cafés'],
      ['Jarrito', 3500, 'Cafés'],
      ['Café Doble', 4500, 'Cafés'],
      ['Capuchino Grande', 5000, 'Cafés'],
      ['Capuchino Chico', 4000, 'Cafés'],
      ['Submarino Grande', 4800, 'Cafés'],
      ['Submarino Chico', 4000, 'Cafés'],
      ['Alfajor de Maicena', 4000, 'Pastelería'],
      ['Porción de Torta', 6000, 'Pastelería'],
      ['Porción de Tarta', 4500, 'Pastelería'],
      ['Mini Tarta', 6000, 'Pastelería'],
      ['Budín Mini', 2500, 'Pastelería'],
      ['Budín', 4000, 'Pastelería'],
      ['Medialuna', 800, 'Pastelería'],
      ['Mafalda', 1500, 'Pastelería'],
      ['Factura', 800, 'Pastelería'],
      ['Criollo', 800, 'Pastelería'],
      ['Galletas Cookies', 3500, 'Pastelería'],
      ['Alfajor de Chocolate', 4500, 'Pastelería'],
      ['Scones/Queso x 100g', 3700, 'Pastelería'],
      ['Chipa x 100g', 3000, 'Pastelería'],
      ['Criollos x 100g', 2500, 'Pastelería'],
      ['SIMPLE', 6500, 'Desayunos'],
      ['LIGHT', 9500, 'Desayunos'],
      ['COMPLETO', 8500, 'Desayunos'],
      ['CAMPESTRE', 11000, 'Desayunos'],
      ['FIT', 13500, 'Desayunos'],
      ['FIT PLUS', 15000, 'Desayunos'],
      ['DULCERO', 12000, 'Desayunos'],
      ['AGUA SABORIZADA FRESH', 1800, 'Bebidas'],
      ['AGUA MINERAL VILLAVI', 2000, 'Bebidas'],
      ['GASEOSA PEPSI', 1800, 'Bebidas'],
      ['GASEOSA COCACOLA', 2200, 'Bebidas'],
      ['FANTA NARANJA', 2200, 'Bebidas'],
      ['SPRITE', 1800, 'Bebidas'],
      ['GATORADE', 2400, 'Bebidas'],
      ['JUGO BAGGIO', 1000, 'Bebidas'],
      ['YOGUR MAMFREY', 1500, 'Bebidas'],
      ['YOGUR ILOLAY', 1200, 'Bebidas'],
      ['YOGUR SERENICIMA', 1200, 'Bebidas'],
      ['MOSTER AMARILLO', 3500, 'Bebidas'],
      ['LATA BRAHMA', 3200, 'Bebidas'],
      ['LATA IMPERIAL GOLDEN', 3500, 'Bebidas'],
      ['1 Porción de Tarta + Jarrito', 7500, 'Combos'],
      ['2 Licuados y Tostados', 14500, 'Combos'],
      ['1 Licuado + Tostado', 8500, 'Combos'],
      ['Sandwich de Miga', 2500, 'Otros'],
      ['Tostados', 3500, 'Otros'],
      ['Sandwich Baguette', 3500, 'Otros'],
      ['Sandwich Pan Lactal', 2500, 'Otros'],
      ['1 Cafe/Leche + Mafalda', 5500, 'Combos'],
      ['Ensalada de Frutas', 1500, 'Otros'],
      ['Gelatina', 2000, 'Otros']
    ];

    for (const [nombre, precio, categoria] of productos) {
      await pool.query(
        'INSERT INTO productos (nombre, precio, categoria) VALUES ($1, $2, $3)',
        [nombre, precio, categoria]
      );
    }

    console.log('🍽️ Insertando mesas...');
    for (let i = 1; i <= 20; i++) {
      await pool.query('INSERT INTO mesas (numero, capacidad, estado) VALUES ($1, $2, $3)', [i, 4, 'libre']);
    }

    console.log('👨‍🍳 Insertando mozos...');
for (let i = 1; i <= 5; i++) {
  await pool.query('INSERT INTO mozos (nombre, activo) VALUES ($1, $2)', [`Mozo ${i}`, true]);
}

    console.log('✅ Seed completado: productos, mesas y mozos cargados.');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  }
}

seed();
