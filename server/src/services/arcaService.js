import Afip from '@afipsdk/afip.js';
import dotenv from 'dotenv';
dotenv.config();

function getTodayAsNumber() {
  const now = new Date();
  const offset = -3;
  const local = new Date(now.getTime() + offset * 60 * 60 * 1000);
  const year = local.getUTCFullYear();
  const month = String(local.getUTCMonth() + 1).padStart(2, '0');
  const day = String(local.getUTCDate()).padStart(2, '0');
  return parseInt(`${year}${month}${day}`);
}

const afip = new Afip({
  CUIT: Number(process.env.AFIP_CUIT),
  access_token: process.env.AFIP_ACCESS_TOKEN,
  production: true,
});

export const crearFacturaAFIP = async ({ total, neto, iva, puntoVenta = 1, tipoComprobante = 6 }) => {
  try {
    let lastNumber = 0;
    try {
      lastNumber = await afip.ElectronicBilling.getLastVoucher(puntoVenta, tipoComprobante);
      console.log(`🔢 Último número autorizado: ${lastNumber}`);
    } catch (err) {
      console.warn('No se pudo obtener último número, se usará 0', err.message);
    }
    const nextNumber = lastNumber + 1;

    const fecha = getTodayAsNumber();
    console.log(`📄 Número: ${nextNumber} | Fecha a usar: ${fecha}`);

    const data = {
      CantReg: 1,
      PtoVta: puntoVenta,
      CbteTipo: tipoComprobante,
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
      Iva: [{ Id: 5, BaseImp: neto, Importe: iva }],
      CondicionIVAReceptorId: 5,
    };

    console.log('📤 Enviando a ARCA:', JSON.stringify(data, null, 2));

    const response = await afip.ElectronicBilling.createVoucher(data);
    console.log('📥 Respuesta ARCA:', response);

    const cae = response.CAE || response.FeCabResp?.CAE;
    const vencimiento = response.CAEFchVto || response.FeCabResp?.FchVto;

    if (!cae || !vencimiento) {
      throw new Error('Respuesta ARCA inválida: no se encontró CAE');
    }

    const fechaVencimiento = vencimiento.includes('-') ? vencimiento : `${vencimiento.slice(0,4)}-${vencimiento.slice(4,6)}-${vencimiento.slice(6,8)}`;

    return {
      numero: nextNumber,
      cae,
      vencimiento: fechaVencimiento,
      data,
    };
  } catch (error) {
    console.error('❌ Error ARCA:', error);
    const msg = error.response?.data?.Errors?.[0]?.Msg || error.message;
    throw new Error(`ARCA: ${msg}`);
  }
};

export const generarPDFFactura = async (data, nombreArchivo) => {
  try {
    const pdfResult = await afip.ElectronicBilling.createPDF({
      file_name: nombreArchivo,
      data,
    });
    return { file: pdfResult.file };
  } catch (error) {
    console.error('Error al generar PDF oficial:', error);
    return { file: '/tickets/factura-simulada.pdf' };
  }
};