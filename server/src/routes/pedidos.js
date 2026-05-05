import express from 'express';
import { 
  getPedidos,
  getPedidoActivoPorMesa, 
  crearPedido, 
  agregarProducto, 
  eliminarProducto,
  cerrarPedido 
} from '../controllers/pedidoController.js';

const router = express.Router();

router.get('/', getPedidos);
router.get('/mesa/:mesaId', getPedidoActivoPorMesa);
router.post('/', crearPedido);
router.post('/detalle', agregarProducto);
router.delete('/detalle/:detalleId', eliminarProducto);
router.post('/:id/cerrar', cerrarPedido);

export default router;