import db from '../db/pool.js';

export const getTitulares = (req, res) => {
  try {
    const titulares = db.prepare('SELECT * FROM titulares WHERE activo = 1').all();
    res.json(titulares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Opcional: si querés persistir la selección por sesión, podés usar una tabla `configuracion`
// Por simplicidad, el frontend enviará el id del titular al cerrar el pedido.