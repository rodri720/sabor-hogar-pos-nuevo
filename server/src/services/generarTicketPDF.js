import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pool from '../db/pool.js';
import qr from 'qrcode';

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

const sumarDias = (fecha, dias) => {
  const result = new Date(fecha);
  result.setDate(result.getDate() + dias);
  return result;
};

const formatearPrecio = (valor) => {
  return Number(valor).toLocaleString('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

const generarHTMLFactura = (COMERCIO, pedido, detalles, factura, qrDataUrl) => {
  const puntoVentaFormateado = String(COMERCIO.puntoVenta).padStart(5, '0');
  const numeroComprobante = `${puntoVentaFormateado}-${String(factura.numeroFactura).padStart(8, '0')}`;
  const fechaEmision = new Date();
  const fechaEmisionStr = fechaEmision.toLocaleDateString('es-AR');
  const fechaVtoPago = sumarDias(fechaEmision, 5).toLocaleDateString('es-AR');
  const metodoPago = METODO_TEXTO[pedido.metodo_pago] || pedido.metodo_pago || 'Contado';

  const filasDetalle = detalles.map(d => `
    <tr>
      <td style="padding:4px;border:1px solid #000;">${d.nombre}</td>
      <td style="padding:4px;border:1px solid #000;text-align:center">${d.cantidad}</td>
      <td style="padding:4px;border:1px solid #000;text-align:right">$${formatearPrecio(d.precio_unitario)}</td>
      <td style="padding:4px;border:1px solid #000;text-align:right">$${formatearPrecio(d.subtotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Factura C</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; margin: 20px; }
  .factura { max-width: 700px; margin: 0 auto; border: 1px solid #ccc; padding: 10px; }
  .header { background: #28a745; color: white; text-align: center; padding: 5px; font-weight: bold; margin-bottom: 10px; }
  .row { display: flex; border: 1px solid #000; margin-bottom: 5px; }
  .col { padding: 5px; flex: 1; }
  .col-center { flex: 0 0 60px; text-align: center; border-left: 1px solid #000; border-right: 1px solid #000; }
  .bold { font-weight: bold; }
  table { width: 100%; border-collapse: collapse; margin: 5px 0; }
  th, td { border: 1px solid #000; padding: 4px; text-align: left; }
  th { background: #f2f2f2; }
  .text-right { text-align: right; }
  .text-center { text-align: center; }
  .total { text-align: right; font-weight: bold; font-size: 14px; margin-top: 5px; }
  .footer { display: flex; justify-content: space-between; margin-top: 10px; font-size: 10px; }
  .qr-img { width: 70px; height: 70px; }
</style>
</head>
<body>
<div class="factura">
  <div class="header">FACTURA C - Comprobante Fiscal AFIP</div>
  <div class="row">
    <div class="col">
      <div class="bold">${COMERCIO.nombre}</div>
      <div>Razón Social: ${COMERCIO.razonSocial}</div>
      <div>Domicilio: ${COMERCIO.direccion} ${COMERCIO.barrio ? '- '+COMERCIO.barrio : ''} ${COMERCIO.localidad}</div>
      <div>Inicio Act.: ${COMERCIO.inicioActividades || ''}</div>
    </div>
    <div class="col-center">
      <div style="font-size:28px;font-weight:bold">C</div>
      <div style="font-size:8px">COD.011</div>
    </div>
    <div class="col">
      <div>CUIT: ${COMERCIO.cuit}</div>
      <div>Ingresos Brutos: ${COMERCIO.ingresosBrutos || 'No alcanzado'}</div>
      <div>Punto Venta: ${puntoVentaFormateado}</div>
      <div>Comp. Nº: ${numeroComprobante}</div>
      <div>Condición IVA: ${COMERCIO.condicionIVA}</div>
    </div>
  </div>
  <div class="row">
    <div class="col">Fecha Emisión: ${fechaEmisionStr}</div>
    <div class="col">Condición Venta: Contado</div>
    <div class="col">Vto. Pago: ${fechaVtoPago}</div>
  </div>
  <div class="row">
    <div class="col">Señores: Consumidor Final</div>
    <div class="col">CUIT/DNI: -</div>
    <div class="col">IVA: Consumidor Final</div>
  </div>
  <table>
    <thead><tr><th>Descripción</th><th style="width:60px">Cant.</th><th style="width:90px">Precio</th><th style="width:90px">Subtotal</th></tr></thead>
    <tbody>${filasDetalle}</tbody>
  </table>
  <div style="display:flex; justify-content:space-between; align-items:center; margin-top:5px;">
    <div>Forma de pago: ${metodoPago}</div>
    <div class="total">TOTAL: $${formatearPrecio(pedido.total)}</div>
  </div>
  <div class="footer">
    <div>CAE: ${factura.cae}<br>Vto. CAE: ${factura.vencimientoCAE}<br>Comprobante autorizado AFIP</div>
    <div><img src="${qrDataUrl}" class="qr-img" alt="QR" /><br>Datos del comprobante</div>
  </div>
</div>
</body>
</html>`;
};

export const generarTicketPDF = async (pedido, detalles, factura, titularId) => {
  let titular = null;
  if (titularId) {
    const { rows } = await pool.query('SELECT * FROM titulares WHERE id = $1', [titularId]);
    titular = rows[0];
  }
  if (!titular) {
    const { rows } = await pool.query('SELECT * FROM titulares WHERE activo = true LIMIT 1');
    titular = rows[0];
  }
  if (!titular) {
    throw new Error('No hay titulares configurados');
  }

  const COMERCIO = {
    nombre: titular.nombre,
    razonSocial: titular.razon_social || titular.nombre,
    direccion: titular.direccion || '',
    barrio: titular.barrio || '',
    localidad: titular.localidad || '',
    cuit: titular.cuit || '',
    condicionIVA: titular.condicion_iva || '',
    ingresosBrutos: titular.ingresos_brutos || 'No registrado',
    inicioActividades: titular.inicio_actividades,
    puntoVenta: String(titular.punto_venta || '00001'),
  };

  let vtoCAE = factura.vencimientoCAE;
  if (vtoCAE && typeof vtoCAE === 'string') {
    vtoCAE = vtoCAE.replace(/-/g, '');
  }

  const cuitNum = COMERCIO.cuit.replace(/-/g, '');
  const puntoVentaNum = COMERCIO.puntoVenta.padStart(5, '0');
  const nroComprobante = String(factura.numeroFactura).padStart(8, '0');
  const cae = factura.cae;
  // ✅ CORRECCIÓN AQUÍ: convertir pedido.total a número antes de toFixed
  const importeTotal = Number(pedido.total).toFixed(2);

  const qrPayload = `${cuitNum}|${puntoVentaNum}|${nroComprobante}|${cae}|${vtoCAE}|${importeTotal}`;
  const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${encodeURIComponent(qrPayload)}`;
  const qrDataUrl = await qr.toDataURL(qrUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 150,
    color: { dark: '#000000', light: '#ffffff' }
  });

  const html = generarHTMLFactura(COMERCIO, pedido, detalles, factura, qrDataUrl);
  
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  try {
    await page.setContent(html, { waitUntil: 'domcontentloaded', timeout: 30000 });
    const filename = `factura-${factura.numeroFactura}.pdf`;
    const filepath = path.join(ticketsDir, filename);
    await page.pdf({ path: filepath, format: 'A4', printBackground: true });
    return filepath;
  } finally {
    await browser.close();
  }
};