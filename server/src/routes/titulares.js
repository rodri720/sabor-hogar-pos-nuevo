import express from 'express';
import db from '../db/pool.js';

const router = express.Router();

router.get('/', (req, res) => {
  try {
    const titulares = db.prepare('SELECT id, nombre FROM titulares WHERE activo = 1').all();
    res.json(titulares);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;