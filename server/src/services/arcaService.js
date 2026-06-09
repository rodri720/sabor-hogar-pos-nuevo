import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { Arca } from '@arcasdk/core';
import { getArcaClientForCuit } from './certificateLoader.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

// ====================== FUNCIONES AUXILIARES EXISTENTES ======================
function loadPem(inlineValue, pathEnvVar) {
  if (inlineValue?.includes('BEGIN')) return inlineValue;
  const filePath = process.env[pathEnvVar];
  if (!filePath) {
    throw new Error(
      `Configurá ${pathEnvVar} (ruta al .crt/.key) o AFIP_CERT / AFIP_KEY con el contenido PEM en server/.env`
    );
  }
  return fs.readFileSync(path.resolve(filePath), 'utf8');
}

function fechaArgentina() {
  const tz = new Date(
    new Date().toLocaleString('en-US', { timeZone: 'America/Argentina/Buenos_Aires' })
  );
  return `${tz.getFullYear()}${String(tz.getMonth() + 1).padStart(2, '0')}${String(tz.getDate()).padStart(2, '0')}`;
}

function getArcaClient() {
  const cuit = parseInt(process.env.ARCA_CUIT, 10);
  if (!cuit) throw new Error('ARCA_CUIT no configurado en server/.env');
  const production = process.env.ARCA_PRODUCTION !== 'false';
  const cert = loadPem(process.env.AFIP_CERT, 'ARCA_CERT_PATH');
  const key = loadPem(process.env.AFIP_KEY, 'ARCA_KEY_PATH');
  return new Arca({ cuit, cert, key, production });
}

function extractArcaErrors(result) {
  const fromResponse = result?.response?.Errors?.Err;
  const fromFlat = result?.errors?.err;
  const list = [].concat(fromResponse || [], fromFlat || []).filter(Boolean);
  if (!list.length) return null;
  return list
    .map((e) => {
      const code = e.Code ?? e.code;
      const msg = e.Msg ?? e.msg;
      return `[${code}] ${msg}`;
    })
    .join(' | ');
}

// ====================== CONFIGURACIÓN FISCAL (sigue usando .env) ======================
export function getConfigFiscal() {
  const cbteTipo = parseInt(process.env.ARCA_CBTE_TIPO || '11', 10);
  const ptoVta = parseInt(process.env.ARCA_PTO_VTA || '1', 10);
  return {
    cbteTipo,
    ptoVta,
    esFacturaC: cbteTipo === 11,
    production: process.env.ARCA_PRODUCTION !== 'false',
    cuit: process.env.ARCA_CUIT,
  };
}

export function calcularImportesFiscales(totalBruto) {
  const total = parseFloat(Number(totalBruto).toFixed(2));
  const { esFacturaC } = getConfigFiscal();
  if (esFacturaC) {
    return { total, neto: total, iva: 0 };
  }
  const neto = parseFloat((total / 1.21).toFixed(2));
  const iva = parseFloat((total - neto).toFixed(2));
  return { total, neto, iva };
}

// ====================== DIAGNÓSTICO (opcional) ======================
export async function diagnosticarArca() {
  const arca = getArcaClient();
  const config = getConfigFiscal();
  const [status, puntos, last] = await Promise.all([
    arca.electronicBillingService.getServerStatus(),
    arca.electronicBillingService.getSalesPoints(),
    arca.electronicBillingService.getLastVoucher(config.ptoVta, config.cbteTipo),
  ]);
  return { config, status, puntos, last, errores: extractArcaErrors(last) || extractArcaErrors(puntos) };
}

// ====================== NUEVA FUNCIÓN crearFacturaAFIP (MULTI‑TITULAR) ======================
export async function crearFacturaAFIP({
  total,
  neto,
  iva,
  puntoVenta,
  tipoComprobante,
  cuitTitular,
}) {
  // Usa el loader que selecciona el certificado según el CUIT del titular
  const arca = getArcaClientForCuit(cuitTitular, true);
  const pto = puntoVenta;
  const tipo = tipoComprobante;
  const esFacturaC = tipo === 11;

  const payload = {
    CantReg: 1,
    PtoVta: pto,
    CbteTipo: tipo,
    Concepto: 1,
    DocTipo: 99,
    DocNro: 0,
    CbteFch: fechaArgentina(),
    ImpTotal: total,
    ImpTotConc: 0,
    ImpNeto: esFacturaC ? total : neto,
    ImpOpEx: 0,
    ImpIVA: esFacturaC ? 0 : iva,
    ImpTrib: 0,
    MonId: 'PES',
    MonCotiz: 1,
    CondicionIVAReceptorId: 5,
    Cuit: cuitTitular,   // CUIT del titular que emite
  };

  if (!esFacturaC && iva > 0) {
    payload.Iva = [{ Id: 5, BaseImp: neto, Importe: iva }];
  }

  const result = await arca.electronicBillingService.createNextVoucher(payload);
  const errMsg = extractArcaErrors(result);
  if (errMsg || !result.cae) {
    throw new Error(errMsg || 'ARCA no devolvió CAE');
  }

  const detRaw = result.response?.FeDetResp?.FECAEDetResponse;
  const det = Array.isArray(detRaw) ? detRaw[0] : detRaw;
  const numero = det?.CbteDesde;
  const vencRaw = String(result.caeFchVto || det?.CAEFchVto || '');
  const vencimiento =
    vencRaw.length === 8
      ? `${vencRaw.slice(0, 4)}-${vencRaw.slice(4, 6)}-${vencRaw.slice(6, 8)}`
      : vencRaw;

  return {
    numero,
    cae: result.cae,
    vencimiento,
    numeroFactura: numero,
    vencimientoCAE: vencimiento,
  };
}