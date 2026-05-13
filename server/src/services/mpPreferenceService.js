import { MercadoPagoConfig, Preference } from 'mercadopago';

/**
 * Crea una preferencia de Checkout Pro (link / QR con la URL de pago).
 * Requiere MERCADOPAGO_ACCESS_TOKEN en server/.env (credencial de producción o test).
 */
export async function crearPreferenciaCobro({
  pedidoId,
  monto,
  titulo,
}) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) return null;

  const client = new MercadoPagoConfig({ accessToken: token });
  const preference = new Preference(client);

  const unit = Number(Number(monto).toFixed(2));

  const body = {
    items: [
      {
        id: `pedido-${pedidoId}`,
        title: titulo || `Sabor Hogar — Pedido #${pedidoId}`,
        quantity: 1,
        unit_price: unit,
        currency_id: 'ARS',
      },
    ],
    binary_mode: true,
    external_reference: `pedido-${pedidoId}`,
  };

  const result = await preference.create({ body });

  return {
    id: result.id,
    init_point: result.init_point,
    sandbox_init_point: result.sandbox_init_point,
    /** URL a codificar en QR (sandbox en pruebas, producción en prod). */
    payment_url: result.sandbox_init_point || result.init_point,
  };
}
