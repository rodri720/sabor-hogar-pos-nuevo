import db from '../db/pool.js';

try {
  console.log("🧹 limpiando productos...");
  db.prepare('DELETE FROM productos').run();

  const insert = db.prepare(
    'INSERT INTO productos (nombre, precio, categoria) VALUES (?, ?, ?)'
  );

  // ========== CAFÉS ==========
  insert.run('Café Chico', 2700, 'Cafés');
  insert.run('Jarrito', 3500, 'Cafés');
  insert.run('Café Doble', 4500, 'Cafés');
  insert.run('Capuchino Grande', 5000, 'Cafés');
  insert.run('Capuchino Chico', 4000, 'Cafés');
  insert.run('Submarino Grande', 4800, 'Cafés');
  insert.run('Submarino Chico', 4000, 'Cafés');

  // ========== PASTELERÍA ==========
  insert.run('Alfajor de Maicena', 4000, 'Pastelería');
  insert.run('Porción de Torta', 6000, 'Pastelería');
  insert.run('Porción de Tarta', 4500, 'Pastelería');
  insert.run('Mini Tarta', 6000, 'Pastelería');
  insert.run('Budín Mini', 2500, 'Pastelería');
  insert.run('Budín', 4000, 'Pastelería');
  insert.run('Medialuna', 800, 'Pastelería');
  insert.run('Mafalda', 1500, 'Pastelería');
  insert.run('Factura', 800, 'Pastelería');
  insert.run('Criollo', 800, 'Pastelería');
  insert.run('Galletas Cookies', 3500, 'Pastelería');
  insert.run('Alfajor de Chocolate', 4500, 'Pastelería');
  insert.run('Scones/Queso x 100g', 3700, 'Pastelería');
  insert.run('Chipa x 100g', 3000, 'Pastelería');
  insert.run('Criollos x 100g', 2500, 'Pastelería');

  // ========== DESAYUNOS / MERIENDAS ==========
  insert.run('SIMPLE', 6500, 'Desayunos');
  insert.run('LIGHT', 9500, 'Desayunos');
  insert.run('COMPLETO', 8500, 'Desayunos');
  insert.run('CAMPESTRE', 11000, 'Desayunos');
  insert.run('FIT', 13500, 'Desayunos');
  insert.run('FIT PLUS', 15000, 'Desayunos');
  insert.run('DULCERO', 12000, 'Desayunos');

  // ========== BEBIDAS ==========
  insert.run('AGUA SABORIZADA FRESH', 1800, 'Bebidas');
  insert.run('AGUA MINERAL VILLAVI', 2000, 'Bebidas');
  insert.run('GASEOSA PEPSI', 1800, 'Bebidas');
  insert.run('GASEOSA COCACOLA', 2200, 'Bebidas');
  insert.run('FANTA NARANJA', 2200, 'Bebidas');
  insert.run('SPRITE', 1800, 'Bebidas');
  insert.run('GATORADE', 2400, 'Bebidas');
  insert.run('JUGO BAGGIO', 1000, 'Bebidas');
  insert.run('YOGUR MAMFREY', 1500, 'Bebidas');
  insert.run('YOGUR ILOLAY', 1200, 'Bebidas');
  insert.run('YOGUR SERENICIMA', 1200, 'Bebidas');
  insert.run('MOSTER AMARILLO', 3500, 'Bebidas');
  insert.run('LATA BRAHMA', 3200, 'Bebidas');
  insert.run('LATA IMPERIAL GOLDEN', 3500, 'Bebidas');

  // ========== COMBOS / OTROS ==========
  insert.run('1 Porción de Tarta + Jarrito', 7500, 'Combos');
  insert.run('2 Licuados y Tostados', 14500, 'Combos');
  insert.run('1 Licuado + Tostado', 8500, 'Combos');
  insert.run('Sandwich de Miga', 2500, 'Otros');
  insert.run('Tostados', 3500, 'Otros');
  insert.run('Sandwich Baguette', 3500, 'Otros');
  insert.run('Sandwich Pan Lactal', 2500, 'Otros');
  insert.run('1 Cafe/Leche + Mafalda', 5500, 'Combos');
  insert.run('Ensalada de Frutas', 1500, 'Otros');
  insert.run('Gelatina', 2000, 'Otros');

  console.log("✅ productos cargados con categorías");
} catch (error) {
  console.error("❌ Error al sembrar productos:", error);
}