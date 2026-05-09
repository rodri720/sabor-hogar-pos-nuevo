export const crearFacturaAFIP = async ({ total }) => {
  return {
    numeroFactura: Math.floor(Math.random() * 10000),
    cae: 'TEST-CAE-123456',
    vencimientoCAE: new Date().toISOString().slice(0, 10),
  };
};