import express from 'express';
import { getMesas, updateMesaEstado } from '../controllers/mesaController.js';

const router = express.Router();

router.get('/', getMesas);
router.patch('/:id/estado', updateMesaEstado);

export default router;