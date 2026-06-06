import fs from 'fs';
import { Arca } from '@arcasdk/core';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config();

const certPath = path.resolve(process.env.ARCA_CERT_PATH);
const keyPath = path.resolve(process.env.ARCA_KEY_PATH);

console.log('Cert path:', certPath);
console.log('Key path:', keyPath);

try {
  const cert = fs.readFileSync(certPath, 'utf8');
  const key = fs.readFileSync(keyPath, 'utf8');
  console.log('Archivos leídos correctamente');

  const arca = new Arca({
    cuit: parseInt(process.env.ARCA_CUIT),
    cert,
    key,
    production: false,
  });

  console.log('Consultando último comprobante...');
  const last = await arca.electronicBillingService.getLastVoucher(1, 6);
  console.log('✅ Último comprobante:', last);
} catch (err) {
  console.error('❌ Error:', err.message);
  console.error(err.stack);
}