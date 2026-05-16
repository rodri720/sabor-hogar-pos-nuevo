import db from '../db/pool.js';

try {
  console.log("🧹 limpiando productos...");

  db.prepare('DELETE FROM productos').run();

  const insert = db.prepare(
    'INSERT INTO productos (nombre, precio) VALUES (?, ?)'
  );

  // Café y varios
  insert.run('Café Chico', 2700);
  insert.run('Jarrito', 3500);
  insert.run('Café Doble', 4500);
  insert.run('Capuchino Grande', 5000);
  insert.run('Capuchino Chico', 4000);
  insert.run('Submarino Grande', 4800);
  insert.run('Submarino Chico', 4000);
  insert.run('Alfajor de Maicena', 4000);
  insert.run('Porción de Torta', 6000);
  insert.run('Porción de Tarta', 4500);
  insert.run('Mini Tarta', 6000);
  insert.run('Budín Mini', 2500);
  insert.run('Budín', 4000);

  // Desayunos y meriendas
  insert.run('SIMPLE', 6500);
  insert.run('LIGHT', 9500);
  insert.run('COMPLETO', 8500);
  insert.run('CAMPESTRE', 11000);
  insert.run('FIT', 13500);
  insert.run('FIT PLUS', 15000);
  insert.run('DULCERO', 12000);

  // Bebidas
  insert.run('AGUA SABORIZADA FRESH', 1800);
  insert.run('AGUA MINERAL VILLAVI', 2000);
  insert.run('GASEOSA PEPSI', 1800);
  insert.run('GASEOSA COCACOLA', 2200);
  insert.run('FANTA NARANJA', 2200);
  insert.run('SPRITE', 1800);
  insert.run('GATORADE', 2400);
  insert.run('JUGO BAGGIO', 1000);
  insert.run('YOGUR MAMFREY', 1500);
  insert.run('YOGUR ILOLAY', 1200);
  insert.run('YOGUR SERENICIMA', 1200);
  insert.run('MOSTER AMARILLO', 3500);
  insert.run('LATA BRAHMA', 3200);
  insert.run('LATA IMPERIAL GOLDEN', 3500);

  // Combos y varios del último archivo
  insert.run('1 Porción de Tarta + Jarrito', 7500);
  insert.run('2 Licuados y Tostados', 14500);
  insert.run('1 Licuado + Tostado', 8500);
  insert.run('Sandwich de Miga', 2500);
  insert.run('Tostados', 3500);
  insert.run('Sandwich Baguette', 3500);
  insert.run('Sandwich Pan Lactal', 2500);
  insert.run('1 Cafe/Leche + Mafalda', 5500);
  insert.run('Medialuna', 800);
  insert.run('Mafalda', 1500);
  insert.run('Factura', 800);
  insert.run('Criollo', 800);
  insert.run('Galletas Cookies', 3500);
  insert.run('Alfajor de Chocolate', 4500);
  insert.run('Ensalada de Frutas', 1500);
  insert.run('Gelatina', 2000);
  insert.run('Scones/Queso x 100g', 3700);
  insert.run('Chipa x 100g', 3000);
  insert.run('Criollos x 100g', 2500);

  console.log("✅ productos cargados");

} catch (error) {
  console.error(error);
}