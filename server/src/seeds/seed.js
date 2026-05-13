import db from '../db/pool.js';

db.exec(`
  INSERT OR IGNORE INTO mesas (numero, estado) VALUES
    (1, 'libre'),
    (2, 'libre'),
    (3, 'libre'),
    (4, 'libre'),
    (5, 'libre');

  INSERT OR IGNORE INTO mozos (nombre, codigo) VALUES
    ('Juan', '001'),
    ('Ana', '002');
`);

const productosBar = [
  // Cafetería
  ['Café espresso', 900, 'Café'],
  ['Café con leche', 1100, 'Café'],
  ['Café cortado', 1000, 'Café'],
  ['Capuchino', 1400, 'Café'],
  ['Lagrima', 1000, 'Café'],
  ['Submarino', 1200, 'Café'],
  ['Café americano', 950, 'Café'],
  ['Té (varios)', 800, 'Café'],
  ['Té con leche', 950, 'Café'],
  // Dulces / panadería
  ['Medialunas (x3)', 1200, 'Dulces'],
  ['Croissant', 900, 'Dulces'],
  ['Tostado jamón y queso', 2800, 'Dulces'],
  ['Tostado de manteca', 1500, 'Dulces'],
  ['Torta porción', 2200, 'Dulces'],
  ['Alfajor artesanal', 800, 'Dulces'],
  ['Brownie', 1500, 'Dulces'],
  // Bebidas sin alcohol
  ['Agua mineral', 800, 'Bebidas'],
  ['Gaseosa línea', 1000, 'Bebidas'],
  ['Jugo exprimido naranja', 1800, 'Bebidas'],
  ['Limonada', 1400, 'Bebidas'],
  ['Smoothie frutilla', 2200, 'Bebidas'],
  // Cervezas
  ['Cerveza rubia pinta', 2800, 'Cervezas'],
  ['Cerveza IPA pinta', 3200, 'Cervezas'],
  ['Cerveza negra pinta', 3000, 'Cervezas'],
  ['Cerveza sin alcohol', 2400, 'Cervezas'],
  ['Chopp chico', 1800, 'Cervezas'],
  // Tragos / bar
  ['Fernet con cola', 2800, 'Bar'],
  ['Gin tonic', 3500, 'Bar'],
  ['Mojito', 3200, 'Bar'],
  ['Caipiroska', 3000, 'Bar'],
  ['Aperol spritz', 3800, 'Bar'],
  ['Whisky (doble)', 4500, 'Bar'],
  ['Campari naranja', 2800, 'Bar'],
  ['Champagne copa', 4000, 'Bar'],
  // Comidas
  ['Picada para 2', 8500, 'Comidas'],
  ['Picada para 4', 15000, 'Comidas'],
  ['Papas fritas', 4500, 'Comidas'],
  ['Rabas fritas', 7200, 'Comidas'],
  ['Hamburguesa clásica', 6500, 'Comidas'],
  ['Hamburguesa vegana', 7000, 'Comidas'],
  ['Milanesa napolitana', 7800, 'Comidas'],
  ['Ensalada Caesar', 5500, 'Comidas'],
  ['Sandwich de bondiola', 6200, 'Comidas'],
  ['Empanadas (docena)', 9000, 'Comidas'],
  ['Empanadas (media)', 4800, 'Comidas'],
  ['Pizza muzarella', 11000, 'Comidas'],
  ['Pizza especial', 13500, 'Comidas'],
  ['Fainá porción', 1200, 'Comidas'],
];

const insertProducto = db.prepare(`
  INSERT INTO productos (nombre, precio, categoria)
  SELECT ?, ?, ?
  WHERE NOT EXISTS (SELECT 1 FROM productos WHERE nombre = ?)
`);

for (const [nombre, precio, categoria] of productosBar) {
  insertProducto.run(nombre, precio, categoria, nombre);
}

console.log('Datos básicos insertados (mesas, mozos, menú bar)');
