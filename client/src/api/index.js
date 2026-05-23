// ==================== CONFIGURACIÓN ====================
export const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// ==================== FETCH UTILS ====================
async function fetchApi(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `${res.status} ${path}`);
  }
  if (res.status === 204) return null;
  return await res.json();
}

async function fetchApiList(path) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) throw new Error(`${res.status} ${path}`);
  const data = await res.json();
  return { data: Array.isArray(data) ? data : [] };
}

// ==================== MESAS ====================
export const getMesas = () => fetchApiList('/api/mesas');
export const crearMesa = (mesa) => fetchApi('/api/mesas', { method: 'POST', body: JSON.stringify(mesa) });
export const actualizarMesa = (id, datos) => fetchApi(`/api/mesas/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarMesa = (id) => fetchApi(`/api/mesas/${id}`, { method: 'DELETE' });
export const liberarMesa = (id) => fetchApi(`/api/mesas/${id}/liberar`, { method: 'DELETE' });

// ==================== MOZOS ====================
export const getMozos = () => fetchApiList('/api/mozos');
export const crearMozo = (mozo) => fetchApi('/api/mozos', { method: 'POST', body: JSON.stringify(mozo) });
export const actualizarMozo = (id, datos) => fetchApi(`/api/mozos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarMozo = (id) => fetchApi(`/api/mozos/${id}`, { method: 'DELETE' });

// ==================== PRODUCTOS ====================
export const getProductos = () => fetchApiList('/api/productos');
export const crearProducto = (producto) => fetchApi('/api/productos', { method: 'POST', body: JSON.stringify(producto) });
export const actualizarProducto = (id, datos) => fetchApi(`/api/productos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarProducto = (id) => fetchApi(`/api/productos/${id}`, { method: 'DELETE' });

// ==================== COMBOS ====================
export const getCombos = () => fetchApiList('/api/combos');
export const crearCombo = (combo) => fetchApi('/api/combos', { method: 'POST', body: JSON.stringify(combo) });
export const actualizarCombo = (id, datos) => fetchApi(`/api/combos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarCombo = (id) => fetchApi(`/api/combos/${id}`, { method: 'DELETE' });

// ==================== GASTOS ====================
export const getGastos = (fecha) => fetchApiList(`/api/gastos?fecha=${fecha}`);
export const crearGasto = (gasto) => fetchApi('/api/gastos', { method: 'POST', body: JSON.stringify(gasto) });
export const actualizarGasto = (id, datos) => fetchApi(`/api/gastos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarGasto = (id) => fetchApi(`/api/gastos/${id}`, { method: 'DELETE' });

// ==================== VENTAS / CIERRE ====================
export const getVentasPorFecha = (fecha) => fetchApiList(`/api/ventas?fecha=${fecha}`);
export const getCierreDiario = (fecha) => fetchApi(`/api/cierre?fecha=${fecha}`);
export const crearVenta = (venta) => fetchApi('/api/ventas', { method: 'POST', body: JSON.stringify(venta) });

// ==================== TITULARES ====================
export const getTitulares = () => fetchApiList('/api/titulares');
export const crearTitular = (titular) => fetchApi('/api/titulares', { method: 'POST', body: JSON.stringify(titular) });
export const actualizarTitular = (id, datos) => fetchApi(`/api/titulares/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarTitular = (id) => fetchApi(`/api/titulares/${id}`, { method: 'DELETE' });

// ==================== PEDIDOS ====================
export const getPedidoActivoPorMesa = (mesaId) => fetchApi(`/api/pedidos/mesa/${mesaId}`);
export const crearPedido = (pedido) => fetchApi('/api/pedidos', { method: 'POST', body: JSON.stringify(pedido) });
export const agregarProductoAPedido = (pedidoId, productoId, cantidad) =>
  fetchApi(`/api/pedidos/${pedidoId}/agregarProducto`, {
    method: 'POST',
    body: JSON.stringify({ producto_id: productoId, cantidad }),
  });
export const cerrarPedido = (pedidoId, metodo_pago, titular_id) =>
  fetchApi(`/api/pedidos/${pedidoId}/cerrar`, {
    method: 'POST',
    body: JSON.stringify({ metodo_pago, titular_id }),
  });
export const preferenciaMercadoPago = (pedidoId) =>
  fetchApi(`/api/pedidos/${pedidoId}/preferencia-mp`, { method: 'POST' });

// ==================== INSUMOS (STOCK) ====================
export const getInsumos = () => fetchApiList('/api/insumos');
export const crearInsumo = (insumo) => fetchApi('/api/insumos', { method: 'POST', body: JSON.stringify(insumo) });
export const actualizarInsumo = (id, datos) => fetchApi(`/api/insumos/${id}`, { method: 'PUT', body: JSON.stringify(datos) });
export const eliminarInsumo = (id) => fetchApi(`/api/insumos/${id}`, { method: 'DELETE' });
export const reponerInsumo = (id, cantidad) => fetchApi(`/api/insumos/${id}/reponer`, { method: 'POST', body: JSON.stringify({ cantidad }) });

// ==================== REPORTES ====================
export const getVentasPorTurno = async (fecha, turno) => {
  const { data: ventas } = await getVentasPorFecha(fecha);
  const filtradas = ventas.filter(v => {
    const hora = new Date(v.fecha).getHours();
    const esManana = hora < 15;
    return turno === 'mañana' ? esManana : !esManana;
  });
  return { data: filtradas };
};

export const getGastosPorTurno = async (fecha, turno) => {
  const { data: gastos } = await getGastos(fecha);
  return { data: gastos };
};

export const getResumenDia = async (fecha) => {
  const ventasManana = await getVentasPorTurno(fecha, 'mañana');
  const ventasTarde = await getVentasPorTurno(fecha, 'tarde');
  const gastosManana = await getGastosPorTurno(fecha, 'mañana');
  const gastosTarde = await getGastosPorTurno(fecha, 'tarde');

  const calcularResumenTurno = (ventas, gastos) => {
    const porMetodo = { efectivo: 0, qr: 0, transferencia: 0, debito: 0, tarjeta: 0 };
    ventas.data.forEach(v => {
      if (porMetodo[v.metodo_pago] !== undefined) 
        porMetodo[v.metodo_pago] += v.total;
    });
    const totalVentas = Object.values(porMetodo).reduce((a,b) => a+b, 0);
    const totalGastos = gastos.data.reduce((acc, g) => acc + g.monto, 0);
    return { porMetodo, totalVentas, totalGastos, ganancia: totalVentas - totalGastos };
  };

  return {
    data: {
      mañana: calcularResumenTurno(ventasManana, gastosManana),
      tarde: calcularResumenTurno(ventasTarde, gastosTarde),
    },
  };
};