import express from 'express';
import { getInsumos, createInsumo, updateInsumo, deleteInsumo, reponerInsumo } from '../controllers/insumoController.js';

const router = express.Router();

router.get('/', getInsumos);
router.post('/', createInsumo);
router.put('/:id', updateInsumo);
router.delete('/:id', deleteInsumo);
router.post('/:id/reponer', reponerInsumo);

export default router;