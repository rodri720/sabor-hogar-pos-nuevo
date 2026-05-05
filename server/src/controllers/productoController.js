import db from '../db/pool.js';

export const getProductos = async (req, res) => {
  try {
    const result = db
      .prepare('SELECT * FROM productos WHERE activo = 1 ORDER BY categoria, nombre')
      .all();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const createProducto = async (req, res) => {
  const { nombre, precio, categoria } = req.body;
  try {
    const info = db
      .prepare('INSERT INTO productos (nombre, precio, categoria) VALUES (?, ?, ?)')
      .run(nombre, precio, categoria);

    const result = db
      .prepare('SELECT * FROM productos WHERE id = ?')
      .get(info.lastInsertRowid);

    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProducto = async (req, res) => {
  const { id } = req.params;
  const { nombre, precio, categoria, activo } = req.body;
  try {
    const info = db
      .prepare(
        'UPDATE productos SET nombre = ?, precio = ?, categoria = ?, activo = ? WHERE id = ?'
      )
      .run(nombre, precio, categoria, activo, id);

    if (info.changes === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const result = db
      .prepare('SELECT * FROM productos WHERE id = ?')
      .get(id);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProducto = async (req, res) => {
  const { id } = req.params;
  try {
    db.prepare('UPDATE productos SET activo = 0 WHERE id = ?').run(id);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};