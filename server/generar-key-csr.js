import { generateKeyPairSync } from 'crypto';
import { writeFileSync } from 'fs';
import forge from 'node-forge';

// Generar par de claves RSA de 2048 bits
const { privateKey, publicKey } = generateKeyPairSync('rsa', {
  modulusLength: 2048,
  privateKeyEncoding: { type: 'pkcs1', format: 'pem' },
  publicKeyEncoding: { type: 'spki', format: 'pem' }
});

// Guardar clave privada
writeFileSync('clave_privada.key', privateKey);
console.log('✅ Clave privada generada: clave_privada.key');

// Crear CSR usando node-forge
const pki = forge.pki;
const rsaPrivateKey = pki.privateKeyFromPem(privateKey);
const csr = pki.createCertificationRequest();

csr.setSubject([
  { name: 'C', value: 'AR' },
  { name: 'O', value: 'ROSSI KATERINNE MICAELA SOLANGE' },
  { name: 'CN', value: 'certificado_produccion_saborhogar' },
  { name: 'serialNumber', value: 'CUIT 27384132702' }
]);

// Extraer clave pública de la privada
csr.setPublicKey(pki.publicKeyFromPem(publicKey));
csr.sign(rsaPrivateKey);
const csrPem = pki.certificationRequestToPem(csr);
writeFileSync('solicitud.csr', csrPem);
console.log('✅ CSR generado: solicitud.csr');