import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

// Configurar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ticketsDir = path.join(__dirname, '../../tickets');

// Asegurar que la carpeta tickets existe
if (!fs.existsSync(ticketsDir)) {
  fs.mkdirSync(ticketsDir, { recursive: true });
}

const ETIQUETA_METODO = {
  efectivo: 'PAGO EN EFECTIVO',
  debito: 'PAGO CON DÉBITO',
  tarjeta: 'PAGO CON TARJETA',
  transferencia: 'TRANSFERENCIA BANCARIA',
  qr: 'PAGO CON QR',
};

const generarHTMLFactura = (pedido, detalles, factura) => {
  const metodoTexto = ETIQUETA_METODO[pedido.metodo_pago] || pedido.metodo_pago;
  const fechaEmision = new Date().toLocaleDateString('es-AR', {
    timeZone: 'America/Argentina/Buenos_Aires',
  });
  const periodo = new Date().toLocaleDateString('es-AR', {
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Argentina/Buenos_Aires',
  });

  return `
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"><style>
      body { font-family: monospace; margin: 2rem; }
      .header { text-align: center; }
      .factura-titulo { font-size: 1.2rem; font-weight: bold; margin-top: 1rem; }
      table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
      th, td { border: 1px solid #000; padding: 0.3rem; text-align: left; }
      .total { text-align: right; margin-top: 1rem; }
      .cae { text-align: center; margin-top: 2rem; font-size: 0.9rem; }
    </style></head>
    <body>
      <div class="header">
        <h3>PANADERÍA Y DESPENSA</h3>
        <p>Uritorco 4508 Villa Adela - Córdoba (CP 5010)</p>
        <p>IIBB: Reg. Simplificado Cba - No alcanzado</p>
        <p>Inicio actividades: 01/07/2022</p>
        <p>CUIT: 20367740842 | Condición IVA: Monotributista</p>
        <div class="factura-titulo">FACTURA C — Comprobante Fiscal AFIP</div>
      </div>
      <p>Punto de venta: 0003 | Comp. N°: 0003-${String(factura.numeroFactura).padStart(8, '0')}</p>
      <p>Fecha: ${fechaEmision}</p>
      <p>Cond. de venta: Contado | Período: ${periodo}</p>
      <p>Señores: Consumidor Final | CUIT/DNI: — | Cond. IVA: Consumidor Final</p>
      <table>
        <thead><tr><th>Descripción</th><th>Cant.</th><th>Precio unit.</th><th>Subtotal</th></tr></thead>
        <tbody>
          ${detalles.map(d => `
            <tr>
              <td>${d.nombre || 'Producto'}</td>
              <td>${d.cantidad}</td>
              <td>$${Number(d.precio_unitario).toFixed(2)}</td>
              <td>$${Number(d.subtotal).toFixed(2)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="total">TOTAL: $${Number(pedido.total).toFixed(2)}</div>
      <div>${metodoTexto}</div>
      <div class="cae">
        CAE N°: ${factura.cae}<br>
        Vto. CAE: ${factura.vencimientoCAE}<br>
        Comprobante autorizado por ARCA/AFIP.<br>
        Válido como comprobante fiscal.<br>
        Verificar en AFIP
      </div>
    </body>
    </html>
  `;
};

export const generarTicketPDF = async (pedido, detalles, factura) => {
  const html = generarHTMLFactura(pedido, detalles, factura);
  const browser = await puppeteer.launch({ args: ['--no-sandbox'] }); // para entornos sin sandbox
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const filename = `factura-${factura.numeroFactura}.pdf`;
  const filepath = path.join(ticketsDir, filename);
  await page.pdf({ path: filepath, format: 'A4', printBackground: true });
  await browser.close();
  return filepath;
};