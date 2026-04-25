import express from 'express';
import { getProductos, createProducto, updateProducto, deleteProducto } from '../controllers/productoController.js';

const router = express.Router();

router.get('/', getProductos);
router.post('/', createProducto);
router.put('/:id', updateProducto);
router.delete('/:id', deleteProducto);

export default router;