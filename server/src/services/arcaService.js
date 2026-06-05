import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { init, callWsfe } from 'arca-facturacion';

// Configura la zona horaria de Argentina
process.env.TZ = 'America/Argentina/Buenos_Aires';

// Función auxiliar para obtener fecha en formato yyyymmdd
function getTodayAsNumber() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

// Leer los archivos del certificado de producción
const certPath = path.resolve(process.env.AFIP_CERT_PATH);
const keyPath = path.resolve(process.env.AFIP_KEY_PATH);
const cert = fs.readFileSync(certPath, 'utf8');
const key = fs.readFileSync(keyPath, 'utf8');

// Inicializa la librería para ARCA
init({
  certPath,
  keyPath,
  cuit: Number(process.env.AFIP_CUIT),
  production: true // 'false' para pruebas (homologación)
});

// Función para obtener el último número de comprobante
async function getLastVoucher(puntoVenta, tipoComprobante) {
  const response = await callWsfe('FECompUltimoAutorizado', {
    PtoVta: puntoVenta,
    CbteTipo: tipoComprobante
  });
  return response.FECompUltimoAutorizadoResult.CbteNro;
}

export const crearFacturaAFIP = async ({ total, neto, iva, puntoVenta = 1, tipoComprobante = 6 }) => {
  try {
    // 1. Obtener el último número autorizado
    let lastNumber = 0;
    try {
      lastNumber = await getLastVoucher(puntoVenta, tipoComprobante);
      console.log(`🔢 Último número autorizado: ${lastNumber}`);
    } catch (err) {
      console.warn('No se pudo obtener último número, se usará 0', err.message);
    }

    const nextNumber = lastNumber + 1;
    const fecha = getTodayAsNumber();

    // 2. Armar el payload de la factura
    const data = {
      FeCAEReq: {
        FeCabReq: {
          CantReg: 1,
          PtoVta: puntoVenta,
          CbteTipo: tipoComprobante
        },
        FeDetReq: {
          FECAEDetRequest: [{
            Concepto: 1,
            DocTipo: 99,
            DocNro: 0,
            CbteDesde: nextNumber,
            CbteHasta: nextNumber,
            CbteFch: fecha,
            ImpTotal: total,
            ImpTotConc: 0,
            ImpNeto: neto,
            ImpOpEx: 0,
            ImpIVA: iva,
            ImpTrib: 0,
            MonId: 'PES',
            MonCotiz: 1,
            CondicionIVAReceptorId: 5,
            Iva: { AlicIva: [{ Id: 5, BaseImp: neto, Importe: iva }] }
          }]
        }
      }
    };

    console.log('📤 Enviando a ARCA:', JSON.stringify(data, null, 2));

    // 3. Llamar al servicio de emisión
    const response = await callWsfe('FECAESolicitar', data);
    const result = response.FECAESolicitarResult;
    const cae = result.FeCabResp.CAE;
    const vencimiento = result.FeCabResp.FchVto;
    const fechaVencimiento = `${vencimiento.slice(0,4)}-${vencimiento.slice(4,6)}-${vencimiento.slice(6,8)}`;

    return {
      numero: nextNumber,
      cae,
      vencimiento: fechaVencimiento,
      data: response,
    };
  } catch (error) {
    console.error('❌ Error ARCA:', error);
    throw new Error(`ARCA: ${error.message}`);
  }
};

// Función para mantener compatibilidad con el flujo existente (el PDF oficial no se usa, se genera con Puppeteer)
export const generarPDFFactura = async (data, nombreArchivo) => {
  console.warn('generarPDFFactura: No se genera PDF oficial, se usará el ticket generado por Puppeteer');
  return { file: '/tickets/factura-simulada.pdf' };
};