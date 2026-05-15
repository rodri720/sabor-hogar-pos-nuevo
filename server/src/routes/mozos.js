import express from 'express';
import { getMozos } from '../controllers/mozoController.js';
const router = express.Router();
router.get('/', getMozos);

export default router;