import db from '../db/pool.js';

db.exec(`
  INSERT OR IGNORE INTO mesas (numero, estado) VALUES
    (1, 'libre'),
    (2, 'libre'),
    (3, 'libre'),
    (4, 'libre'),
    (5, 'libre');

  INSERT OR IGNORE INTO productos (nombre, precio, categoria) VALUES
    ('Café', 150.00, 'Café'),
    ('Té', 120.00, 'Café'),
    ('Medialuna', 80.00, 'Dulces'),
    ('Torta', 200.00, 'Dulces');

  INSERT OR IGNORE INTO mozos (nombre, codigo) VALUES
    ('Juan', '001'),
    ('Ana', '002');
`);

console.log('Datos básicos insertados');