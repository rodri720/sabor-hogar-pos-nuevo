import express from 'express';
import { getGastos, createGasto } from '../controllers/gastoController.js';
const router = express.Router();
router.get('/', getGastos);
router.post('/', createGasto);
export default router;