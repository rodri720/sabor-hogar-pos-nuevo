import { diagnosticarArca, getConfigFiscal } from '../src/services/arcaService.js';

console.log('=== Diagnóstico ARCA / AFIP ===\n');

try {
  const config = getConfigFiscal();
  console.log('Configuración:');
  console.log('  CUIT:', config.cuit);
  console.log('  Producción:', config.production);
  console.log('  Punto de venta:', config.ptoVta);
  console.log('  Tipo comprobante:', config.cbteTipo, config.esFacturaC ? '(Factura C)' : '');
  console.log('');

  const { status, puntos, last, errores } = await diagnosticarArca();

  console.log('Estado servidores AFIP:', JSON.stringify(status, null, 2));
  console.log('\nPuntos de venta habilitados:', JSON.stringify(puntos, null, 2));
  console.log('\nÚltimo comprobante (PV', config.ptoVta + ', tipo', config.cbteTipo + '):');
  console.log(JSON.stringify(last, null, 2));

  if (errores) {
    console.log('\n❌ Errores detectados:', errores);
    console.log(`
Acciones habituales:
  1. Entrá a AFIP con clave fiscal → "Administración de puntos de venta y domicilios"
  2. Dá de alta un punto de venta "Factura electrónica - Monotributo" (no RECE)
  3. Verificá que el certificado digital esté asociado al servicio wsfe
  4. En server/.env usá ARCA_PRODUCTION=true (certificado de producción)
  5. ARCA_PTO_VTA debe coincidir con el número dado de alta en AFIP
  6. Para monotributo: ARCA_CBTE_TIPO=11 (Factura C)
`);
    process.exit(1);
  }

  console.log('\n✅ Conexión OK. Punto de venta habilitado.');
} catch (err) {
  console.error('\n❌ Fallo de conexión:', err.message);
  process.exit(1);
}
