import express from 'express';
import { getCierreDiario } from '../controllers/cierreController.js';
const router = express.Router();
router.get('/', getCierreDiario);
export default router;