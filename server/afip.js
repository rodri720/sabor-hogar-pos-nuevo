import Afip from '@afipsdk/afip.js';
import dotenv from 'dotenv';
dotenv.config();

const afip = new Afip({
  CUIT: 20409378472,
  access_token: process.env.AFIP_ACCESS_TOKEN,
});

export const getNextVoucherNumber = async (puntoVenta = 1, tipoComprobante = 6) => {
  try {
    const last = await afip.ElectronicBilling.getLastVoucher(puntoVenta, tipoComprobante);
    console.log(`🔢 Último número autorizado por ARCA: ${last}`);
    return last + 1;
  } catch (error) {
    console.error('❌ Error consultando último comprobante:', error);
    throw new Error(`No se pudo obtener el próximo número: ${error.message}`);
  }
};

export const crearFacturaAFIP = async ({ total, neto, iva, puntoVenta = 2, tipoComprobante = 6 }) => {
  try {
    const nextNumber = await getNextVoucherNumber(puntoVenta, tipoComprobante);
    console.log(`📄 Número de comprobante a enviar: ${nextNumber}`);

    // Fecha con zona horaria Argentina
    const ahora = new Date();
    const fechaArg = new Date(ahora.toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' }));
    const año = fechaArg.getFullYear();
    const mes = String(fechaArg.getMonth() + 1).padStart(2, '0');
    const dia = String(fechaArg.getDate()).padStart(2, '0');
    const fechaFormateada = parseInt(`${año}${mes}${dia}`, 10);

    const data = {
      CantReg: 1,
      PtoVta: puntoVenta,
      CbteTipo: tipoComprobante,
      Concepto: 1,
      DocTipo: 99,
      DocNro: 0,
      CbteDesde: nextNumber,
      CbteHasta: nextNumber,
      CbteFch: fechaFormateada,
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
    const cae = response.FeCabResp.CAE;
    const vencimiento = response.FeCabResp.FchVto;
    const fechaVencimiento = `${vencimiento.slice(0,4)}-${vencimiento.slice(4,6)}-${vencimiento.slice(6,8)}`;

    return {
      numero: nextNumber,
      cae,
      vencimiento: fechaVencimiento,
      data,
    };
  } catch (error) {
    console.error('❌ Error completo de ARCA:', error);
    if (error.response?.data) {
      console.error('📄 Detalle del error ARCA:', JSON.stringify(error.response.data, null, 2));
    }
    let msg = error.message || 'Error desconocido';
    if (error.response?.data?.Errors?.[0]?.Msg) {
      msg = error.response.data.Errors[0].Msg;
    }
    throw new Error(`ARCA: ${msg}`);
  }
};

export const generarPDFFactura = async (data, nombreArchivo) => {
  try {
    const pdfResult = await afip.ElectronicBilling.createPDF({
      file_name: nombreArchivo,
      data,
    });
    return pdfResult.file;
  } catch (error) {
    console.error('Error al generar PDF:', error);
    throw new Error('No se pudo generar el PDF de la factura');
  }
};

export const testSalesPoints = async () => {
  const points = await afip.ElectronicBilling.getSalesPoints();
  console.log('Puntos de venta habilitados:', points);
  return points;
};

