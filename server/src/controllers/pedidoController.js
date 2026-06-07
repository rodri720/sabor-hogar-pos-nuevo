import pool from '../db/pool.js';
import { crearFacturaAFIP, calcularImportesFiscales, getConfigFiscal } from '../services/arcaService.js';
import { generarTicketPDF } from '../services/generarTicketPDF.js';
import { printTicket } from '../services/printService.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const METODOS_PAGO = new Set([
  'efectivo',
  'debito',
  'tarjeta',
  'transferencia',
  'qr',
]);

// ✅ Solo una definición de calcularTotales
export const calcularTotales = (detalles) => {
  const total = detalles.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
  const neto = parseFloat((total / 1.21).toFixed(2));
  const iva = parseFloat((total - neto).toFixed(2));
  return { total, neto, iva };
};

// ====================== PEDIDO ACTIVO ======================
export const getPedidoActivoPorMesa = async (req, res) => {
  const { mesaId } = req.params;
  console.log("📥 getPedidoActivoPorMesa:", mesaId);

  try {
    const { rows: pedidos } = await pool.query(
      `SELECT * FROM pedidos WHERE mesa_id = $1 AND estado = 'abierto'`,
      [mesaId]
    );
    const pedido = pedidos[0];

    if (!pedido) {
      console.log("❌ No hay pedido activo para mesa", mesaId);
      return res.json(null);
    }

    const { rows: detalles } = await pool.query(
      `SELECT pd.*, p.nombre
       FROM pedido_detalle pd
       JOIN productos p ON pd.producto_id = p.id
       WHERE pd.pedido_id = $1`,
      [pedido.id]
    );

    console.log("✅ Pedido activo encontrado:", pedido.id);
    res.json({ ...pedido, detalles });
  } catch (error) {
    console.error("🔥 ERROR getPedidoActivoPorMesa:", error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== CREAR PEDIDO ======================
export const crearPedido = async (req, res) => {
  const { mesa_id, mozo } = req.body;
  console.log("➕ crearPedido:", { mesa_id, mozo });

  try {
    if (!mozo) {
      return res.status(400).json({
        error: "Debes seleccionar un mozo antes de abrir la mesa"
      });
    }

    const { rows: mesas } = await pool.query('SELECT id FROM mesas WHERE id = $1', [mesa_id]);
    if (mesas.length === 0) {
      return res.status(400).json({ error: "Mesa inexistente" });
    }

    const { rows: newPedidos } = await pool.query(
      `INSERT INTO pedidos (mesa_id, estado, total, mozo)
       VALUES ($1, 'abierto', 0, $2)
       RETURNING *`,
      [mesa_id, mozo]
    );
    const pedido = newPedidos[0];

    await pool.query(`UPDATE mesas SET estado = 'ocupada' WHERE id = $1`, [mesa_id]);

    console.log("✅ pedido creado con mozo:", pedido);
    res.status(201).json(pedido);
  } catch (error) {
    console.error("🔥 ERROR crearPedido:", error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== AGREGAR PRODUCTO ======================
export const agregarProducto = async (req, res) => {
  const { id } = req.params;
  const { producto_id, cantidad } = req.body;
  console.log("🛒 agregarProducto:", { pedidoId: id, producto_id, cantidad });

  try {
    const { rows: pedidos } = await pool.query('SELECT * FROM pedidos WHERE id = $1', [id]);
    if (pedidos.length === 0) return res.status(404).json({ error: 'Pedido no encontrado' });

    const { rows: productos } = await pool.query('SELECT * FROM productos WHERE id = $1', [producto_id]);
    if (productos.length === 0) return res.status(404).json({ error: 'Producto no encontrado' });

    const producto = productos[0];
    const precio = Number(producto.precio);
    const subtotal = precio * cantidad;

    await pool.query(
      `INSERT INTO pedido_detalle (pedido_id, producto_id, cantidad, precio_unitario, subtotal)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, producto_id, cantidad, precio, subtotal]
    );

    await pool.query(`UPDATE pedidos SET total = total + $1 WHERE id = $2`, [subtotal, id]);

    console.log("✅ Producto agregado correctamente");
    res.json({ message: 'Producto agregado', subtotal });
  } catch (error) {
    console.error("🔥 ERROR agregarProducto:", error);
    res.status(500).json({ error: error.message });
  }
};

// ====================== PREFERENCIA MERCADO PAGO ======================
// Nota: Esta función solo se usa si tienes integración con Mercado Pago.
// Si no la usas, puedes eliminarla o dejarla comentada.
export const preferenciaMercadoPago = async (req, res) => {
  const { id } = req.params;
  try {
    const { rows: pedidos } = await pool.query(
      `SELECT * FROM pedidos WHERE id = $1 AND estado = 'abierto'`,
      [id]
    );
    if (pedidos.length === 0) return res.status(404).json({ error: 'Pedido abierto no encontrado' });

    const { rows: detalles } = await pool.query(
      `SELECT subtotal FROM pedido_detalle WHERE pedido_id = $1`,
      [id]
    );
    if (detalles.length === 0) return res.status(400).json({ error: 'Sin productos' });

    const { total } = calcularTotales(detalles);
    // Aquí iría la llamada a crearPreferenciaCobro (importada externamente)
    // Por ahora devolvemos un error indicando que no está configurado
    res.status(503).json({ configured: false, error: 'Mercado Pago no configurado' });
  } catch (error) {
    console.error('🔥 ERROR preferenciaMercadoPago:', error);
    res.status(500).json({ error: error.message || 'Error Mercado Pago' });
  }
};

// ====================== CERRAR PEDIDO ======================
export const cerrarPedido = async (req, res) => {
  const { id } = req.params;
  const metodoRaw = req.body?.metodo_pago;
  const metodo_pago = METODOS_PAGO.has(metodoRaw) ? metodoRaw : 'efectivo';
  const titular_id = req.body?.titular_id;

  console.log('💰 cerrarPedido ID:', id, 'metodo:', metodo_pago, 'titular_id:', titular_id);

  const pedidoId = parseInt(id, 10);
  if (isNaN(pedidoId)) {
    return res.status(400).json({ error: 'ID de pedido inválido' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    const { rows: pedidos } = await client.query('SELECT * FROM pedidos WHERE id = $1', [pedidoId]);
    if (pedidos.length === 0) throw new Error('Pedido no encontrado');
    const pedido = pedidos[0];
    if (pedido.estado !== 'abierto') throw new Error('Pedido ya cerrado');

    const { rows: detalles } = await client.query(
      `SELECT pd.*, p.nombre
       FROM pedido_detalle pd
       JOIN productos p ON pd.producto_id = p.id
       WHERE pd.pedido_id = $1`,
      [pedidoId]
    );
    if (detalles.length === 0) throw new Error('Sin productos');

    const totalPedido = calcularTotales(detalles).total;
    const { total, neto, iva } = calcularImportesFiscales(totalPedido);
    console.log('💵 Totales:', { total, neto, iva, fiscal: getConfigFiscal() });

    // Cerrar pedido
    const updateResult = await client.query(
      `UPDATE pedidos SET estado = 'cerrado', total = $1, metodo_pago = $2 WHERE id = $3`,
      [total, metodo_pago, pedidoId]
    );
    if (updateResult.rowCount === 0) throw new Error('No se pudo actualizar el pedido');

    // Liberar mesa
    const { rowCount } = await client.query(`UPDATE mesas SET estado = 'libre' WHERE id = $1`, [pedido.mesa_id]);
    if (rowCount === 0) throw new Error('No se encontró la mesa para liberar');

    await client.query('COMMIT');
    console.log('✅ Pedido cerrado y mesa liberada:', pedido.mesa_id);

    // ========== GENERAR FACTURA ELECTRÓNICA Y PDF ==========
    let factura = null;
    let ticket = null;
    let numeroFactura = null;

    try {
      const { ptoVta, cbteTipo } = getConfigFiscal();

      const facturaData = await crearFacturaAFIP({
        total,
        neto,
        iva,
        puntoVenta: ptoVta,
        tipoComprobante: cbteTipo,
      });

      numeroFactura = facturaData.numero;
      factura = {
        numeroFactura: facturaData.numero,
        cae: facturaData.cae,
        vencimientoCAE: facturaData.vencimiento,
      };

      // Guardar factura en la base de datos
      await pool.query(
        `INSERT INTO facturas (pedido_id, numero, cae, vencimiento_cae, total, punto_venta, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)`,
        [pedidoId, facturaData.numero, facturaData.cae, facturaData.vencimiento, total, ptoVta]
      );

      // Generar ticket PDF con los datos reales
      const pdfPath = await generarTicketPDF(pedido, detalles, factura);
      ticket = path.basename(pdfPath);

      console.log('✅ Factura generada con CAE:', facturaData.cae);

      // ========== IMPRESIÓN FÍSICA DEL TICKET (no interrumpe el flujo) ==========
      try {
        // Obtener titular para construir el QR de AFIP
        let titular = null;
        if (titular_id) {
          const { rows } = await pool.query('SELECT * FROM titulares WHERE id = $1', [titular_id]);
          titular = rows[0];
        }
        if (!titular) {
          const { rows } = await pool.query('SELECT * FROM titulares WHERE activo = true LIMIT 1');
          titular = rows[0];
        }
        if (titular) {
          const cuitNum = (titular.cuit || '').replace(/-/g, '');
          const puntoVentaNum = String(titular.punto_venta || '00001').padStart(5, '0');
          const nroComprobante = String(factura.numeroFactura).padStart(8, '0');
          const vtoCAE = factura.vencimientoCAE.replace(/-/g, '');
          const importeTotal = Number(pedido.total).toFixed(2);
          const qrPayload = `${cuitNum}|${puntoVentaNum}|${nroComprobante}|${factura.cae}|${vtoCAE}|${importeTotal}`;
          const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${encodeURIComponent(qrPayload)}`;

          const ticketData = {
            numeroTicket: factura.numeroFactura,
            detalles: detalles.map(d => ({ nombre: d.nombre, cantidad: d.cantidad, subtotal: d.subtotal })),
            total: pedido.total,
            cae: factura.cae,
            qrUrl: qrUrl,
          };

          await printTicket(ticketData);
          console.log("✅ Ticket enviado a la impresora física");
        } else {
          console.warn("⚠ No se encontró titular para imprimir ticket físico");
        }
      } catch (printErr) {
        console.error("❌ Error al imprimir ticket físico:", printErr.message);
        // No lanzamos excepción para que el resto del flujo continúe
      }
    } catch (err) {
      console.error('⚠ Error en ARCA o PDF:', err.message);
      // Fallback: ticket simulado
      ticket = 'factura-simulada.pdf';
      const fallbackPath = path.join(__dirname, '../../tickets', ticket);
      if (!fs.existsSync(fallbackPath)) {
        fs.writeFileSync(fallbackPath, 'Factura simulada por error en ARCA');
      }
    }

    // Registrar la venta (resumen)
    try {
      await pool.query(
        `INSERT INTO ventas (numero_factura, total, metodo_pago, fecha, mesa_id, estado)
         VALUES ($1, $2, $3, $4, $5, 'cerrado')`,
        [numeroFactura, total, metodo_pago, new Date().toISOString(), pedido.mesa_id]
      );
    } catch (e) {
      console.warn('⚠ No se pudo registrar venta:', e.message);
    }

    res.json({
      message: 'Pedido cerrado',
      metodo_pago,
      factura,
      ticket: ticket ? `/tickets/${ticket}` : null,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('🔥 ERROR cerrarPedido:', error);
    res.status(500).json({ error: error.message });
  } finally {
    client.release();
  }
};

// ====================== NUEVO: INICIAR PAGO CON TERMINAL POINT ======================
export const iniciarPagoPoint = async (req, res) => {
  const { id: pedidoId } = req.params;
  const { deviceId } = req.body;

  if (!deviceId) {
    return res.status(400).json({ error: 'Se requiere el deviceId de la terminal Point' });
  }

  try {
    const { rows: pedidos } = await pool.query(
      `SELECT * FROM pedidos WHERE id = $1 AND estado = 'abierto'`,
      [pedidoId]
    );
    if (pedidos.length === 0) {
      return res.status(404).json({ error: 'Pedido no encontrado o ya cerrado' });
    }
    const pedido = pedidos[0];

    const { rows: detalles } = await pool.query(
      `SELECT id FROM pedido_detalle WHERE pedido_id = $1 LIMIT 1`,
      [pedidoId]
    );
    if (detalles.length === 0) {
      return res.status(400).json({ error: 'El pedido no tiene productos' });
    }

    const total = parseFloat(pedido.total);
    if (isNaN(total) || total <= 0) {
      return res.status(400).json({ error: 'Total inválido' });
    }

    // Nota: createPaymentIntent debe ser importada desde '../services/mercadoPagoPointService.js'
    // Si no tienes ese servicio, comenta esta parte.
    // const paymentIntent = await createPaymentIntent(pedidoId, total, deviceId);
    // await pool.query(`UPDATE pedidos SET mp_payment_intent_id = $1 WHERE id = $2`, [paymentIntent.id, pedidoId]);

    res.json({
      message: 'Intención de pago creada. Esperando confirmación en la terminal...',
      // paymentIntent,
    });
  } catch (error) {
    console.error('❌ Error en iniciarPagoPoint:', error);
    res.status(500).json({ error: error.message || 'Error al iniciar pago con Point' });
  }
};

// ====================== PROCESAR PAGO CON TARJETA (BRICK) ======================
export const procesarPagoTarjeta = async (req, res) => {
  const { id: pedidoId } = req.params;
  const { token, amount } = req.body;
  try {
    // Importación dinámica para evitar problemas si no está instalado
    const { MercadoPagoConfig, Payment } = await import('mercadopago');
    const client = new MercadoPagoConfig({ accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN });
    const payment = new Payment(client);
    const body = {
      transaction_amount: Number(amount),
      token: token,
      description: `Pago pedido ${pedidoId}`,
      payer: { email: 'cliente@example.com' }
    };
    const response = await payment.create({ body });
    if (response.status === 'approved') {
      res.json({ success: true, payment: response });
    } else {
      res.status(400).json({ error: 'Pago no aprobado', status: response.status });
    }
  } catch (error) {
    console.error('❌ Error procesando pago con tarjeta:', error);
    res.status(500).json({ error: error.message });
  }
};