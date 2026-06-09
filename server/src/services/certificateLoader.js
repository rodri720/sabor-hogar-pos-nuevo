import fs from 'fs';
import path from 'path';
import { Arca } from '@arcasdk/core';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const certBase = path.join(__dirname, '../../certificados');

const certConfig = {
  '27384132702': {  // Katerine (CUIT sin guiones)
    cert: path.join(certBase, 'katerine/certificado_katerine.crt'),
    key: path.join(certBase, 'katerine/clave_katerine.key'),
  },
  '27219838080': {  // María
    cert: path.join(certBase, 'maria/certificado_maria.crt'),
    key: path.join(certBase, 'maria/clave_maria.key'),
  },
};

export function getArcaClientForCuit(cuit, production = true) {
  const config = certConfig[cuit];
  if (!config) throw new Error(`No hay certificado configurado para CUIT ${cuit}`);
  if (!fs.existsSync(config.cert) || !fs.existsSync(config.key)) {
    throw new Error(`Archivos no encontrados para CUIT ${cuit}: ${config.cert}, ${config.key}`);
  }
  const cert = fs.readFileSync(config.cert, 'utf8');
  const key = fs.readFileSync(config.key, 'utf8');
  return new Arca({ cuit: parseInt(cuit, 10), cert, key, production });
}