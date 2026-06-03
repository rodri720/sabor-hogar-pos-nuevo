// server/src/services/mpPreferenceService.js
import { MercadoPagoConfig, Preference } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

export const crearPreferenciaCobro = async ({ pedidoId, monto, titulo }) => {
  try {
    const preference = new Preference(client);
    const body = {
      items: [
        {
          id: pedidoId.toString(),
          title: titulo,
          quantity: 1,
          unit_price: Number(monto),
          currency_id: 'ARS',
        },
      ],
      back_urls: {
        success: `${process.env.FRONTEND_URL}/pago-exitoso`,
        failure: `${process.env.FRONTEND_URL}/pago-fallido`,
        pending: `${process.env.FRONTEND_URL}/pago-pendiente`,
      },
      auto_return: 'approved',
      notification_url: `${process.env.BACKEND_URL}/api/webhooks/mercadopago`,
    };
    const response = await preference.create({ body });
    return {
      id: response.id,
      init_point: response.init_point,
      sandbox_init_point: response.sandbox_init_point,
    };
  } catch (error) {
    console.error('Error creando preferencia:', error);
    return null;
  }
};