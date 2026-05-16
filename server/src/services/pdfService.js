import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/pool.js'; // Ajusta la ruta si es necesario

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ticketsDir = path.join(__dirname, '../../tickets');

if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true });

const METODO_TEXTO = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia Bancaria',
  qr: 'QR / Mercado Pago',
};

const generarHTMLFactura = (COMERCIO, pedido, detalles, factura) => {
  const numeroComprobante = `${COMERCIO.puntoVenta}-${String(factura.numeroFactura).padStart(8, '0')}`;
  const fecha = new Date().toLocaleDateString('es-AR');
  const periodo = new Date().toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' });
  const metodoTexto = METODO_TEXTO[pedido.metodo_pago] || pedido.metodo_pago;

  const filasProductos = detalles.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td>${d.cantidad}</td>
      <td>$${Number(d.precio_unitario).toFixed(2)}</td>
      <td>$${Number(d.subtotal).toFixed(2)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Factura C - ${numeroComprobante}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Courier New', monospace; background: #fff; margin: 20px; color: #000; font-size: 12px; }
    .invoice-box { max-width: 800px; margin: auto; padding: 20px; border: 1px solid #000; background: #fff; }
    .header { text-align: center; margin-bottom: 20px; }
    .header h1 { font-size: 18px; margin-bottom: 5px; }
    .datos-fiscales { text-align: center; margin-bottom: 15px; border-bottom: 1px dashed #000; padding-bottom: 10px; }
    .tipo-factura { text-align: center; font-weight: bold; font-size: 14px; margin: 10px 0; background: #eee; padding: 5px; }
    .info-line { display: flex; justify-content: space-between; margin-bottom: 5px; }
    .cliente { margin: 15px 0; border-top: 1px solid #000; border-bottom: 1px solid #000; padding: 8px 0; }
    table { width: 100%; border-collapse: collapse; margin: 15px 0; }
    th, td { border: 1px solid #000; padding: 6px; text-align: left; }
    th { background-color: #f2f2f2; font-weight: bold; }
    .totales { text-align: right; margin: 10px 0; font-weight: bold; }
    .cae { text-align: center; margin: 20px 0 10px; font-weight: bold; border-top: 1px solid #000; padding-top: 10px; }
    .footer { text-align: center; font-size: 10px; margin-top: 15px; }
  </style>
</head>
<body>
<div class="invoice-box">
  <div class="header">
    <h1>${COMERCIO.nombre}</h1>
    <p>${COMERCIO.razonSocial}</p>
    <p>${COMERCIO.direccion} - ${COMERCIO.localidad}</p>
    <p>IIBB: ${COMERCIO.iibb} | Inicio actividades: ${COMERCIO.inicioActividades}</p>
    <p>CUIT: ${COMERCIO.cuit} | Condición IVA: ${COMERCIO.condicionIVA}</p>
  </div>
  <div class="tipo-factura"> FACTURA C — Comprobante Fiscal AFIP</div>
  <div class="info-line">
    <span>Punto de venta: ${COMERCIO.puntoVenta}</span>
    <span>Comp. N°: ${numeroComprobante}</span>
  </div>
  <div class="info-line">
    <span>Fecha: ${fecha}</span>
    <span>Cond. de venta: Contado</span>
    <span>Período: ${periodo}</span>
  </div>
  <div class="cliente">Señores: Consumidor Final | CUIT/DNI: — | Cond. IVA: Consumidor Final</div>
  <table>
    <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
    <tbody>${filasProductos}</tbody>
  </table>
  <div class="totales">
    <p>TOTAL: $${Number(pedido.total).toFixed(2)}</p>
    <p>${metodoTexto}</p>
  </div>
  <div class="cae">
    CAE N°: ${factura.cae}<br>
    Vto. CAE: ${factura.vencimientoCAE}
  </div>
  <div class="footer">
    Comprobante autorizado por ARCA/AFIP.<br>
    Válido como comprobante fiscal.<br>
    Verificar en <a href="https://www.afip.gob.ar/verificacion/">AFIP</a>
  </div>
</div>
</body>
</html>`;
};

export const generarTicket = async (pedido, detalles, factura, titularId) => {
  // Obtener datos del titular desde la base de datos
  let titular;
  if (titularId) {
    titular = db.prepare('SELECT * FROM titulares WHERE id = ?').get(titularId);
  }
  if (!titular) {
    titular = db.prepare('SELECT * FROM titulares WHERE activo = 1 LIMIT 1').get();
  }
  if (!titular) {
    throw new Error('No hay titulares configurados');
  }

  const COMERCIO = {
    nombre: titular.nombre,
    razonSocial: titular.razon_social || titular.nombre,
    direccion: titular.direccion,
    localidad: titular.localidad,
    cuit: titular.cuit,
    condicionIVA: titular.condicion_iva,
    iibb: titular.iibb || 'No alcanzado',
    inicioActividades: titular.inicio_actividades,
    puntoVenta: titular.punto_venta || '0001',
  };

  const html = generarHTMLFactura(COMERCIO, pedido, detalles, factura);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html);
  const filename = `factura-${factura.numeroFactura}.pdf`;
  const filepath = path.join(ticketsDir, filename);
  await page.pdf({ path: filepath, format: 'A4', printBackground: true });
  await browser.close();
  return filepath;
};