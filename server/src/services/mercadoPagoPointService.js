import { MercadoPagoConfig, Point } from 'mercadopago';

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN,
});

const point = new Point(client);

export const createPaymentIntent = async (pedidoId, total, deviceId) => {
  const paymentIntent = {
    device_id: deviceId,
    request: {
      amount: total,
      description: `Pago de pedido ${pedidoId}`,
      payment: {
        installments: 1,
      },
    },
  };
  const response = await point.createPaymentIntent(paymentIntent);
  return response;
};

export const getPaymentStatus = async (paymentIntentId) => {
  return await point.getPaymentIntentStatus({ payment_intent_id: paymentIntentId });
};