import { Router } from 'express';
import { 
  getPedidoActivoPorMesa, 
  crearPedido, 
  agregarProducto, 
  preferenciaMercadoPago, 
  cerrarPedido,
  iniciarPagoPoint,
  procesarPagoTarjeta   // ✅ Agregar esta línea
} from '../controllers/pedidoController.js';

const router = Router();

router.post('/:id/pago-point', iniciarPagoPoint);
router.get('/mesa/:mesaId', getPedidoActivoPorMesa);
router.post('/', crearPedido);
router.post('/:id/preferencia-mp', preferenciaMercadoPago);
router.post('/:id/agregarProducto', agregarProducto);
router.post('/:id/cerrar', cerrarPedido);
router.post('/:id/procesar-pago-tarjeta', procesarPagoTarjeta);  // ✅ nueva ruta

export default router;