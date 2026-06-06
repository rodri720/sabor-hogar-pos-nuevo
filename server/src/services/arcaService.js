import { Arca } from "@arcasdk/core";

// Inicializar con tu certificado y clave (archivos .pem)
const arca = new Arca({
  cuit: 20111111112,        // Reemplazá con tu CUIT
  cert: process.env.AFIP_CERT, // Contenido del certificado (o ruta)
  key: process.env.AFIP_KEY,   // Contenido de la clave privada
  production: false,           // true cuando pases a producción
});

// Ejemplo de función para crear factura
export async function crearFacturaAFIP(pedidoData) {
  const lastVoucher = await arca.electronicBillingService.getLastVoucher(1, 6);
  const nextNumber = lastVoucher + 1;

  const factura = await arca.electronicBillingService.createVoucher({
    CantReg: 1,
    PtoVta: 1,
    CbteTipo: 6,
    Concepto: 1,
    DocTipo: 99,
    DocNro: 0,
    CbteDesde: nextNumber,
    CbteHasta: nextNumber,
    ImpTotal: pedidoData.total,
    ImpNeto: pedidoData.neto,
    ImpIVA: pedidoData.iva,
    MonId: "PES",
  });

  return factura;
}