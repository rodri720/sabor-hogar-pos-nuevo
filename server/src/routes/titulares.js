import express from 'express';
import { getTitulares, createTitular, updateTitular, deleteTitular } from '../controllers/titularesController.js';

const router = express.Router();

router.get('/', getTitulares);
router.post('/', createTitular);
router.put('/:id', updateTitular);
router.delete('/:id', deleteTitular);

export default router;