import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ticketsDir = path.join(__dirname, '../../tickets');

if (!fs.existsSync(ticketsDir)) fs.mkdirSync(ticketsDir, { recursive: true });

// Datos fijos del comercio (ajústalos a los reales)
const COMERCIO = {
  nombre: 'PANADERÍA Y DESPENSA',
  direccion: 'Uritorco 4508 Villa Adela - Córdoba (CP 5010)',
  iibb: 'Reg. Simplificado Cba - No alcanzado',
  inicioActividades: '01/07/2022',
  cuit: '20367740842',
  condicionIVA: 'Monotributista',
  puntoVenta: '0003',
};

const METODO_TEXTO = {
  efectivo: 'Efectivo',
  debito: 'Débito',
  tarjeta: 'Tarjeta',
  transferencia: 'Transferencia Bancaria',
  qr: 'QR / Mercado Pago',
};

const generarHTMLFactura = (pedido, detalles, factura) => {
  const numeroComprobante = `${COMERCIO.puntoVenta}-${String(factura.numeroFactura).padStart(8, '0')}`;
  const fecha = new Date().toLocaleDateString('es-AR');
  const periodo = new Date().toLocaleDateString('es-AR', { month: '2-digit', year: 'numeric' });
  const metodoTexto = METODO_TEXTO[pedido.metodo_pago] || pedido.metodo_pago;

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Factura C</title>
      <style>
        body {
          font-family: 'Courier New', monospace;
          margin: 2rem;
          font-size: 12px;
        }
        .header {
          text-align: center;
          margin-bottom: 1rem;
        }
        .header h1 {
          font-size: 16px;
          margin: 0;
        }
        .comercio {
          font-size: 14px;
          font-weight: bold;
        }
        .factura-tipo {
          font-weight: bold;
          margin: 1rem 0;
          text-align: center;
        }
        .datos-comprobante {
          margin: 0.5rem 0;
        }
        .cliente {
          margin: 0.5rem 0;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        th, td {
          border: 1px solid black;
          padding: 0.3rem;
          text-align: left;
        }
        th {
          background-color: #f2f2f2;
        }
        .total {
          text-align: right;
          margin: 0.5rem 0;
          font-weight: bold;
        }
        .metodo {
          text-align: right;
          margin: 0.5rem 0;
        }
        .cae {
          text-align: center;
          margin-top: 1.5rem;
          font-weight: bold;
        }
        .footer {
          text-align: center;
          font-size: 10px;
          margin-top: 1rem;
        }
        .link {
          color: blue;
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="header">
        <div class="comercio">${COMERCIO.nombre}</div>
        <div>${COMERCIO.direccion}</div>
        <div>IIBB: ${COMERCIO.iibb}</div>
        <div>Inicio actividades: ${COMERCIO.inicioActividades}</div>
        <div>CUIT: ${COMERCIO.cuit}</div>
        <div>Condición IVA: ${COMERCIO.condicionIVA}</div>
      </div>
      <div class="factura-tipo"> FACTURA C — Comprobante Fiscal AFIP</div>
      <div class="datos-comprobante">
        <div>Punto de venta: ${COMERCIO.puntoVenta}  Comp. N°: ${numeroComprobante}</div>
        <div>Fecha: ${fecha}</div>
        <div>Cond. de venta: Contado</div>
        <div>Período: ${periodo}</div>
      </div>
      <div class="cliente">
        Señores: Consumidor Final | CUIT/DNI: — | Cond. IVA: Consumidor Final
      </div>
      <table>
        <thead>
          <tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr>
        </thead>
        <tbody>
          ${detalles.map(d => `
            <tr>
              <td>${d.nombre}</td>
              <td>${d.cantidad}</td>
              <td>$${Number(d.precio_unitario).toFixed(2)}</td>
              <td>$${Number(d.subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">TOTAL: $${Number(pedido.total).toFixed(2)}</div>
      <div class="metodo">${metodoTexto}</div>
      <div class="cae">
        CAE N°: ${factura.cae}<br>
        Vto. CAE: ${factura.vencimientoCAE}
      </div>
      <div class="footer">
        Comprobante autorizado por ARCA/AFIP.<br>
        Válido como comprobante fiscal.<br>
        Verificar en <span class="link">AFIP</span>
      </div>
    </body>
    </html>
  `;
};

export const generarTicket = async (pedido, detalles, factura) => {
  const html = generarHTMLFactura(pedido, detalles, factura);
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setContent(html);
  const filename = `factura-${factura.numeroFactura}.pdf`;
  const filepath = path.join(ticketsDir, filename);
  await page.pdf({ path: filepath, format: 'A4', printBackground: true });
  await browser.close();
  return filepath;
};