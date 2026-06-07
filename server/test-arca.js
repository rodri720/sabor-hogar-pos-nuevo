import { diagnosticarArca, getConfigFiscal } from './src/services/arcaService.js';

const config = getConfigFiscal();
console.log('Config:', config);

try {
  const result = await diagnosticarArca();
  console.log(JSON.stringify(result, null, 2));
  if (result.errores) {
    console.error('❌', result.errores);
    process.exit(1);
  }
  console.log('✅ ARCA responde correctamente');
} catch (err) {
  console.error('❌ Error:', err.message);
  process.exit(1);
}