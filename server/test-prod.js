import fs from 'fs';
import path from 'path';
import { Arca } from '@arcasdk/core';
import dotenv from 'dotenv';

dotenv.config();

const certPath = path.resolve(process.env.ARCA_CERT_PATH);
const keyPath = path.resolve(process.env.ARCA_KEY_PATH);
const ptoVta = parseInt(process.env.ARCA_PTO_VTA) || 1;

console.log(`Cert: ${certPath}`);
console.log(`Key: ${keyPath}`);
console.log(`Punto de venta: ${ptoVta}`);

try {
  const cert = fs.readFileSync(certPath, 'utf8');
  const key = fs.readFileSync(keyPath, 'utf8');
  console.log('Archivos leídos correctamente');

  const arca = new Arca({
    cuit: parseInt(process.env.ARCA_CUIT),
    cert,
    key,
  });

  const last = await arca.electronicBillingService.getLastVoucher(ptoVta, 6);
  console.log(`✅ Último comprobante (Factura B): ${last}`);
} catch (err) {
  console.error('❌ Error:', err.message);
  if (err.response) console.error('Detalle:', err.response.data);
}
