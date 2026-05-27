import Afip from '@afipsdk/afip.js';
import dotenv from 'dotenv';
dotenv.config();

const afip = new Afip({
  CUIT: 20409378472,
  access_token: process.env.AFIP_ACCESS_TOKEN,
});

async function createSalesPoint() {
  try {
    // Para monotributista: 'FE Monotributo'
    // Para responsable inscripto: 'RECE'
    const result = await afip.Automations.createSalesPoint('FE Monotributo');
    console.log('✅ Punto de venta creado exitosamente:', result);
  } catch (error) {
    console.error('❌ Error al crear punto de venta:', error.response?.data || error.message);
  }
}

createSalesPoint();