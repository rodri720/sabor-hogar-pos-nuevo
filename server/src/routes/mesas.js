import express from 'express';
import { getMesas, updateMesaEstado, liberarMesa } from '../controllers/mesaController.js';

const router = express.Router();

router.get('/', getMesas);
router.post('/:id/liberar', liberarMesa);
router.patch('/:id/estado', updateMesaEstado);

export default router;