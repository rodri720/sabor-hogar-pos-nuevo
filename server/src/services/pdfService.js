import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import db from '../db/pool.js';
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

// Función para sumar días a una fecha
const sumarDias = (fecha, dias) => {
  const result = new Date(fecha);
  result.setDate(result.getDate() + dias);
  return result;
};

// Genera el HTML (se añaden los campos faltantes)
const generarHTMLFactura = (COMERCIO, pedido, detalles, factura, qrDataUrl) => {
  const puntoVentaFormateado = String(COMERCIO.puntoVenta).padStart(5, '0');
  const numeroComprobante = `${puntoVentaFormateado}-${String(factura.numeroFactura).padStart(8, '0')}`;
  const fechaEmision = new Date();
  const fechaEmisionStr = fechaEmision.toLocaleDateString('es-AR');
  const periodoDesde = fechaEmisionStr;
  const periodoHasta = fechaEmisionStr;
  const fechaVtoPago = sumarDias(fechaEmision, 5).toLocaleDateString('es-AR');
  const metodoPago = METODO_TEXTO[pedido.metodo_pago] || pedido.metodo_pago || 'Contado';

  const formatearPrecio = (valor) => {
    return Number(valor).toLocaleString('es-AR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const filasDetalle = detalles.map(d => `
    <tr>
      <td>${d.nombre}</td>
      <td class="text-center">${d.cantidad}</td>
      <td class="text-right">$${formatearPrecio(d.precio_unitario)}</td>
      <td class="text-right">$${formatearPrecio(d.subtotal)}</td>
    </tr>
  `).join('');

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <title>Comprobante Fiscal - Factura C</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            font-size: 11px;
            color: #333;
            margin: 20px;
            background-color: #f9f9f9;
        }
        .factura-box {
            max-width: 700px;
            margin: 0 auto;
            padding: 15px;
            background: #fff;
            border: 1px solid #ccc;
        }
        .header-banner {
            background-color: #28a745;
            color: white;
            text-align: center;
            padding: 5px;
            font-weight: bold;
            font-size: 12px;
            margin-bottom: 10px;
        }
        .top-section {
            display: flex;
            border: 1px solid #000;
            margin-bottom: 10px;
        }
        .top-left {
            width: 45%;
            padding: 8px;
            box-sizing: border-box;
        }
        .top-center {
            width: 10%;
            border-left: 1px solid #000;
            border-right: 1px solid #000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background: #fff;
        }
        .top-center .letra {
            font-size: 32px;
            font-weight: bold;
        }
        .top-center .cod {
            font-size: 8px;
            margin-top: -5px;
        }
        .top-right {
            width: 45%;
            padding: 8px;
            box-sizing: border-box;
        }
        .bold {
            font-weight: bold;
        }
        .info-section {
            border: 1px solid #000;
            margin-bottom: 10px;
            display: flex;
            flex-wrap: wrap;
        }
        .info-row {
            width: 100%;
            display: flex;
            border-bottom: 1px solid #000;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .info-col {
            padding: 5px;
            box-sizing: border-box;
        }
        .client-section {
            border: 1px solid #000;
            margin-bottom: 10px;
        }
        .client-row {
            display: flex;
            border-bottom: 1px solid #000;
        }
        .client-row:last-child {
            border-bottom: none;
        }
        .client-col {
            padding: 5px;
            box-sizing: border-box;
        }
        .items-table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 10px;
        }
        .items-table th, .items-table td {
            border: 1px solid #000;
            padding: 6px;
            text-align: left;
        }
        .items-table th {
            background-color: #f2f2f2;
        }
        .text-right {
            text-align: right;
        }
        .text-center {
            text-align: center;
        }
        .bottom-section {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 10px;
        }
        .payment-method {
            font-size: 10px;
            margin-top: 5px;
        }
        .total-box {
            border: 1px solid #000;
            padding: 8px;
            font-size: 14px;
            font-weight: bold;
            width: 40%;
            text-align: right;
            box-sizing: border-box;
        }
        .footer-fiscal {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-top: 15px;
            font-size: 10px;
        }
        .cai-box {
            line-height: 1.4;
        }
        .qr-box {
            text-align: right;
        }
        .qr-image {
            width: 70px;
            height: 70px;
            margin-bottom: 4px;
        }
    </style>
</head>
<body>

<div class="factura-box">
    <div class="header-banner">
        FACTURA C &nbsp;&nbsp;&nbsp;&nbsp; Comprobante Fiscal AFIP
    </div>

    <div class="top-section">
        <div class="top-left">
            <div class="bold" style="font-size: 13px;">${COMERCIO.nombre}</div>
            <div><strong>Razón Social:</strong> ${COMERCIO.razonSocial}</div>
            <div><strong>Domicilio Comercial:</strong> ${COMERCIO.direccion} - ${COMERCIO.barrio || ''}, ${COMERCIO.localidad}</div>
            <div style="font-size: 9px; margin-top: 5px; color: #555;">
                Inicio de Actividades: ${COMERCIO.inicioActividades}
            </div>
        </div>
        <div class="top-center">
            <div class="letra">C</div>
            <div class="cod">COD. 011</div>
        </div>
        <div class="top-right">
            <div><span class="bold">CUIT:</span> ${COMERCIO.cuit}</div>
            <div><span class="bold">Ingresos Brutos:</span> ${COMERCIO.ingresosBrutos || 'No alcanzado'}</div>
            <div><span class="bold">Punto de venta:</span> ${puntoVentaFormateado}</div>
            <div><span class="bold">Comp. Nº:</span> ${numeroComprobante}</div>
            <div><span class="bold">Condición IVA:</span> ${COMERCIO.condicionIVA}</div>
        </div>
    </div>

    <div class="info-section">
        <div class="info-row">
            <div class="info-col" style="width: 35%;"><span class="bold">Fecha de Emisión:</span> ${fechaEmisionStr}</div>
            <div class="info-col" style="width: 35%;"><span class="bold">Condición de venta:</span> Contado</div>
            <div class="info-col" style="width: 30%;"><span class="bold">Período Facturado Desde:</span> ${periodoDesde}</div>
        </div>
        <div class="info-row">
            <div class="info-col" style="width: 35%;"><span class="bold">Fecha de Vto. para el pago:</span> ${fechaVtoPago}</div>
            <div class="info-col" style="width: 35%;"><span class="bold">Hasta:</span> ${periodoHasta}</div>
            <div class="info-col" style="width: 30%;"></div>
        </div>
    </div>

    <div class="client-section">
        <div class="client-row">
            <div class="client-col" style="width: 50%;"><span class="bold">Señores:</span> Consumidor Final</div>
            <div class="client-col" style="width: 50%;"><span class="bold">CUIT/DNI:</span> -</div>
        </div>
        <div class="client-row">
            <div class="client-col" style="width: 100%;"><span class="bold">Condición frente al IVA:</span> Consumidor Final</div>
        </div>
    </div>

    <table class="items-table">
        <thead>
            <tr>
                <th style="width: 55%;">Descripción</th>
                <th style="width: 10%;" class="text-center">Cant.</th>
                <th style="width: 15%;" class="text-right">Precio unit.</th>
                <th style="width: 20%;" class="text-right">Subtotal</th>
            </tr>
        </thead>
        <tbody>
            ${filasDetalle}
        </tbody>
    </table>

    <div class="bottom-section">
        <div class="payment-method">
            Forma de pago: ${metodoPago}
        </div>
        <div class="total-box">
            TOTAL: $${formatearPrecio(pedido.total)}
        </div>
    </div>

    <div class="footer-fiscal">
        <div class="cai-box">
            <div><span class="bold">CAE Nº:</span> ${factura.cae}</div>
            <div><span class="bold">Vto. CAE:</span> ${factura.vencimientoCAE}</div>
            <div style="font-size: 8px; color: #555; margin-top: 3px;">Comprobante Autorizado por AFIP</div>
        </div>
        <div class="qr-box">
            <img src="${qrDataUrl}" class="qr-image" alt="Código QR" />
            <div style="font-size: 8px; color: #555;">Datos del comprobante</div>
        </div>
    </div>
</div>

</body>
</html>`;
};

export const generarTicket = async (pedido, detalles, factura, titularId) => {
  // Obtener datos del titular
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

  // Construir objeto COMERCIO con todos los campos necesarios (incluyendo barrio e ingresosBrutos)
  const COMERCIO = {
    nombre: titular.nombre,
    razonSocial: titular.razon_social || titular.nombre,
    direccion: titular.direccion,
    barrio: titular.barrio || 'Barrio Avenida',
    localidad: titular.localidad,
    cuit: titular.cuit,
    condicionIVA: titular.condicion_iva,
    iibb: titular.iibb || 'No alcanzado',
    ingresosBrutos: titular.ingresos_brutos || 'No registrado',
    inicioActividades: titular.inicio_actividades,
    puntoVenta: String(titular.punto_venta || '00001'), // asegurar string
  };

  // Generar QR según estándar AFIP para Factura C
  const cuitNum = COMERCIO.cuit.replace(/-/g, '');
  const puntoVentaNum = COMERCIO.puntoVenta.padStart(5, '0');
  const nroComprobante = String(factura.numeroFactura).padStart(8, '0');
  const cae = factura.cae;
  const vtoCAE = factura.vencimientoCAE; // debe venir en formato YYYYMMDD
  const importeTotal = pedido.total.toFixed(2);

  const qrPayload = `${cuitNum}|${puntoVentaNum}|${nroComprobante}|${cae}|${vtoCAE}|${importeTotal}`;
  const qrUrl = `https://www.afip.gob.ar/fe/qr/?p=${encodeURIComponent(qrPayload)}`;

  const qrDataUrl = await qr.toDataURL(qrUrl, {
    errorCorrectionLevel: 'M',
    margin: 1,
    width: 150,
    color: { dark: '#000000', light: '#ffffff' }
  });

  const html = generarHTMLFactura(COMERCIO, pedido, detalles, factura, qrDataUrl);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const filename = `factura-${factura.numeroFactura}.pdf`;
  const filepath = path.join(ticketsDir, filename);
  await page.pdf({ path: filepath, format: 'A4', printBackground: true });
  await browser.close();
  return filepath;
};