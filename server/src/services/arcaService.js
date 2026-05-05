import { Arca } from '@arcasdk/core';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const loadFile = (filename) => fs.readFileSync(path.join(__dirname, '../certs', filename), 'utf8');

export const facturarVenta = async ({ total, neto, iva, puntoDeVenta = 1 }) => {
  const cert = loadFile(process.env.ARCA_CERT_FILE || 'homologacion.crt');
  const key = loadFile(process.env.ARCA_KEY_FILE || 'homologacion.key');

  const arca = new Arca({
    cuit: Number(process.env.ARCA_CUIT),
    cert,
    key,
  });

  const tipoComprobante = Number(process.env.ARCA_TIPO_COMPROBANTE || 6);
  const ultimoComprobante = await arca.electronicBillingService.getLastVoucher(
    puntoDeVenta,
    tipoComprobante
  );
  const numeroComprobante = ultimoComprobante + 1;

  const fechaFormateada = parseInt(new Date().toISOString().slice(0, 10).replace(/-/g, ''), 10);

  const data = {
    CantReg: 1,
    PtoVta: puntoDeVenta,
    CbteTipo: tipoComprobante,
    Concepto: 1,
    DocTipo: 99,
    DocNro: 0,
    CbteDesde: numeroComprobante,
    CbteHasta: numeroComprobante,
    CbteFch: fechaFormateada,
    ImpTotal: total,
    ImpTotConc: 0,
    ImpNeto: neto,
    ImpOpEx: 0,
    ImpIVA: iva,
    ImpTrib: 0,
    MonId: 'PES',
    MonCotiz: 1,
    Iva: [
      {
        Id: 5,
        BaseImp: neto,
        Importe: iva,
      },
    ],
  };

  const result = await arca.electronicBillingService.createVoucher(data);

  return {
    numeroFactura: numeroComprobante,
    cae: result.CAE,
    vencimientoCAE: result.CAEFchVto,
  };
};