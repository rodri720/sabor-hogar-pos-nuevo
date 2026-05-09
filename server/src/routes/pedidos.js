import { Router } from 'express';
import { refacturarPedido } from '../controllers/pedidoController.js';
import { agregarProducto } from '../controllers/pedidoController.js';
import {
  getPedidos,
  getPedidoById,
  getPedidoActivoPorMesa,
  crearPedido,
  actualizarPedido,
  eliminarPedido,
  eliminarProducto,
  cerrarPedido
} from '../controllers/pedidoController.js';

const router = Router();

router.get('/', getPedidos);
router.get('/:id', getPedidoById);
router.get('/mesa/:mesaId', getPedidoActivoPorMesa);
router.post('/', crearPedido);
router.put('/:id', actualizarPedido);
router.delete('/:id', eliminarPedido);
router.post('/:id/agregarProducto', agregarProducto);
router.delete('/detalle/:detalleId', eliminarProducto);
router.post('/:id/cerrar', cerrarPedido);
router.post('/:id/refacturar', refacturarPedido);
router.get('/mesa/:mesaId', getPedidoActivoPorMesa);
router.get('/:id', getPedidoById);

export default router;