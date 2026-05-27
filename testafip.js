import Afip from '@afipsdk/afip.js';
import dotenv from 'dotenv';
dotenv.config();

console.log('Token disponible:', !!process.env.AFIP_ACCESS_TOKEN);

const afip = new Afip({
  CUIT: 20409378472,
  access_token: process.env.AFIP_ACCESS_TOKEN,
  // production: false,   // Descomentar si estás en homologación
});

async function test() {
  try {
    const salesPoints = await afip.ElectronicBilling.getSalesPoints();
    console.log('Puntos de venta:', JSON.stringify(salesPoints, null, 2));
  } catch (error) {
    console.error('Error detallado:', error);
    if (error.response) console.error('Response:', error.response.data);
  }
}

test();
