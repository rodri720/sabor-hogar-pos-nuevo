import { Router } from 'express';

import {
  getPedidoActivoPorMesa,
  crearPedido,
  agregarProducto,
  cerrarPedido,
  preferenciaMercadoPago,
} from '../controllers/pedidoController.js';

const router = Router();

// ✅ pedido por mesa
router.get('/mesa/:mesaId', getPedidoActivoPorMesa);

// ✅ crear pedido
router.post('/', crearPedido);

// ✅ Mercado Pago — link para QR (Checkout Pro)
router.post('/:id/preferencia-mp', preferenciaMercadoPago);

// ✅ agregar producto
router.post('/:id/agregarProducto', agregarProducto);

// ✅ cerrar pedido
router.post('/:id/cerrar', cerrarPedido);

export default router;