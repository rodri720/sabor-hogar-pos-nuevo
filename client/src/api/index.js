import { productosMock, combosMock, mesasMock, mozosMock, insumosMock, gastosMock, ventasStorage, nextVentaId as nextId } from '../mocks.js';

// ========== Funciones existentes (mantenidas) ==========
export const getMesas = () => Promise.resolve({ data: mesasMock });
export const getMozos = () => Promise.resolve({ data: mozosMock });
export const getProductos = () => Promise.resolve({ data: productosMock });
export const getCombos = () => Promise.resolve({ data: combosMock });

let ventas = ventasStorage;
let nextVentaId = nextId;

// ========== Ventas con stock y turno ==========
export const crearVenta = (data) => {
  const turno = new Date().getHours() < 15 ? "mañana" : "tarde";
  let total = 0;
  const itemsConDetalle = data.items.map(item => {
    let precio = item.precio_unitario;
    total += item.cantidad * precio;
    return { ...item, precio_unitario: precio };
  });
  
  const nueva = { 
    id: nextVentaId++, 
    ...data, 
    items: itemsConDetalle,
    total,
    fecha: new Date().toISOString(), 
    estado: 'cerrado',  // Cambiado de 'pendiente' a 'cerrado' para reportes
    turno 
  };
  ventas.push(nueva);
  
  // Descontar stock de productos (si tienen la propiedad stock y consumoPorUnidad)
  data.items.forEach(item => {
    if (item.producto_id) {
      const producto = productosMock.find(p => p.id === item.producto_id);
      if (producto && producto.stock !== undefined) {
        const consumo = producto.consumoPorUnidad || 1;
        producto.stock -= item.cantidad * consumo;
      }
    }
  });
  
  return Promise.resolve({ data: nueva });
};

export const cerrarVenta = (id) => {
  const venta = ventas.find(v => v.id === id);
  if (venta) venta.estado = 'cerrado';
  return Promise.resolve({ data: { success: true } });
};

// Mantener getVentasPorFecha (compatible)
export const getVentasPorFecha = (fecha) => 
  Promise.resolve({ data: ventas.filter(v => v.fecha.startsWith(fecha)) });

// ========== NUEVAS FUNCIONES PARA REPORTES ==========
export const getVentasPorTurno = (fecha, turno) => {
  const fechaInicio = `${fecha}T00:00:00`;
  const fechaFin = `${fecha}T23:59:59`;
  const filtradas = ventas.filter(v => 
    v.fecha >= fechaInicio && v.fecha <= fechaFin && v.turno === turno
  );
  return Promise.resolve({ data: filtradas });
};

export const getGastosPorTurno = (fecha, turno) => {
  const gastosFiltrados = gastosMock.filter(g => g.fecha === fecha && g.turno === turno);
  return Promise.resolve({ data: gastosFiltrados });
};

export const getResumenDia = (fecha) => {
  const ventasMañana = ventas.filter(v => v.fecha.startsWith(fecha) && v.turno === 'mañana');
  const ventasTarde = ventas.filter(v => v.fecha.startsWith(fecha) && v.turno === 'tarde');
  const gastosMañana = gastosMock.filter(g => g.fecha === fecha && g.turno === 'mañana');
  const gastosTarde = gastosMock.filter(g => g.fecha === fecha && g.turno === 'tarde');
  
  const calcularResumenTurno = (ventasTurno, gastosTurno) => {
    const porMetodo = { efectivo: 0, qr: 0, transferencia: 0, debito: 0 };
    ventasTurno.forEach(v => {
      if (porMetodo[v.metodo_pago] !== undefined) 
        porMetodo[v.metodo_pago] += v.total;
    });
    const totalVentas = Object.values(porMetodo).reduce((a,b) => a+b, 0);
    const totalGastos = gastosTurno.reduce((acc, g) => acc + g.monto, 0);
    return { porMetodo, totalVentas, totalGastos, ganancia: totalVentas - totalGastos };
  };
  
  return Promise.resolve({ 
    data: {
      mañana: calcularResumenTurno(ventasMañana, gastosMañana),
      tarde: calcularResumenTurno(ventasTarde, gastosTarde)
    }
  });
};

// ========== CRUD Productos (tus funciones originales, pero mejoradas con stock) ==========
export const crearProducto = (producto) => {
  const newId = Math.max(...productosMock.map(p => p.id), 0) + 1;
  const nuevo = { id: newId, ...producto, precio: Number(producto.precio), stock: Number(producto.stock) || 0 };
  productosMock.push(nuevo);
  return Promise.resolve({ data: nuevo });
};

export const actualizarProducto = (id, datos) => {
  const index = productosMock.findIndex(p => p.id === id);
  if (index !== -1) {
    productosMock[index] = { ...productosMock[index], ...datos, precio: Number(datos.precio), stock: Number(datos.stock) };
    return Promise.resolve({ data: productosMock[index] });
  }
  return Promise.reject('Producto no encontrado');
};

export const eliminarProducto = (id) => {
  const index = productosMock.findIndex(p => p.id === id);
  if (index !== -1) {
    productosMock.splice(index, 1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('Producto no encontrado');
};

// ========== CRUD Combos (tus funciones originales) ==========
export const crearCombo = (combo) => {
  const newId = Math.max(...combosMock.map(c => c.id), 0) + 1;
  const nuevo = { id: newId, ...combo, precio: Number(combo.precio) };
  combosMock.push(nuevo);
  return Promise.resolve({ data: nuevo });
};

export const actualizarCombo = (id, datos) => {
  const index = combosMock.findIndex(c => c.id === id);
  if (index !== -1) {
    combosMock[index] = { ...combosMock[index], ...datos, precio: Number(datos.precio) };
    return Promise.resolve({ data: combosMock[index] });
  }
  return Promise.reject('Combo no encontrado');
};

export const eliminarCombo = (id) => {
  const index = combosMock.findIndex(c => c.id === id);
  if (index !== -1) {
    combosMock.splice(index, 1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('Combo no encontrado');
};

// ========== CRUD Mesas (tus funciones originales) ==========
export const crearMesa = (mesa) => {
  const newId = Math.max(...mesasMock.map(m=>m.id),0)+1;
  const nueva = { id: newId, ...mesa, estado: 'libre' };
  mesasMock.push(nueva);
  return Promise.resolve({ data: nueva });
};

export const actualizarMesa = (id, datos) => {
  const index = mesasMock.findIndex(m=>m.id===id);
  if(index!==-1){
    mesasMock[index]={...mesasMock[index],...datos};
    return Promise.resolve({ data: mesasMock[index] });
  }
  return Promise.reject('No encontrada');
};

export const eliminarMesa = (id) => {
  const index = mesasMock.findIndex(m=>m.id===id);
  if(index!==-1){
    mesasMock.splice(index,1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('No encontrada');
};

// ========== CRUD Mozos (tus funciones originales) ==========
export const crearMozo = (mozo) => {
  const newId = Math.max(...mozosMock.map(m=>m.id),0)+1;
  const nuevo = { id: newId, ...mozo };
  mozosMock.push(nuevo);
  return Promise.resolve({ data: nuevo });
};

export const actualizarMozo = (id, datos) => {
  const index = mozosMock.findIndex(m=>m.id===id);
  if(index!==-1){
    mozosMock[index]={...mozosMock[index],...datos};
    return Promise.resolve({ data: mozosMock[index] });
  }
  return Promise.reject('No encontrado');
};

export const eliminarMozo = (id) => {
  const index = mozosMock.findIndex(m=>m.id===id);
  if(index!==-1){
    mozosMock.splice(index,1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('No encontrado');
};

// ========== NUEVAS FUNCIONES PARA INSUMOS / STOCK ==========
export const getInsumos = () => Promise.resolve({ data: insumosMock });

export const crearInsumo = (insumo) => {
  const newId = Math.max(...insumosMock.map(i => i.id), 0) + 1;
  const nuevo = { id: newId, ...insumo, cantidad: Number(insumo.cantidad), umbral: Number(insumo.umbral) };
  insumosMock.push(nuevo);
  return Promise.resolve({ data: nuevo });
};

export const actualizarInsumo = (id, datos) => {
  const index = insumosMock.findIndex(i => i.id === id);
  if (index !== -1) {
    insumosMock[index] = { ...insumosMock[index], ...datos, cantidad: Number(datos.cantidad), umbral: Number(datos.umbral) };
    return Promise.resolve({ data: insumosMock[index] });
  }
  return Promise.reject('Insumo no encontrado');
};

export const eliminarInsumo = (id) => {
  const index = insumosMock.findIndex(i => i.id === id);
  if (index !== -1) {
    insumosMock.splice(index, 1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('Insumo no encontrado');
};

export const reponerInsumo = (id, cantidadAgregar) => {
  const insumo = insumosMock.find(i => i.id === id);
  if (insumo) {
    insumo.cantidad += Number(cantidadAgregar);
    return Promise.resolve({ data: insumo });
  }
  return Promise.reject('Insumo no encontrado');
};

// ========== NUEVAS FUNCIONES PARA GASTOS ==========
export const getGastos = () => Promise.resolve({ data: gastosMock });

export const crearGasto = (gasto) => {
  const newId = Math.max(...gastosMock.map(g => g.id), 0) + 1;
  const nuevo = { id: newId, ...gasto, monto: Number(gasto.monto), fecha: new Date().toISOString().split('T')[0] };
  gastosMock.push(nuevo);
  return Promise.resolve({ data: nuevo });
};

export const actualizarGasto = (id, datos) => {
  const index = gastosMock.findIndex(g => g.id === id);
  if (index !== -1) {
    gastosMock[index] = { ...gastosMock[index], ...datos, monto: Number(datos.monto) };
    return Promise.resolve({ data: gastosMock[index] });
  }
  return Promise.reject('Gasto no encontrado');
};

export const eliminarGasto = (id) => {
  const index = gastosMock.findIndex(g => g.id === id);
  if (index !== -1) {
    gastosMock.splice(index, 1);
    return Promise.resolve({ data: { success: true } });
  }
  return Promise.reject('Gasto no encontrado');
};

// Mantener getCierreDiario (original, pero ahora se puede usar el resumen)
export const getCierreDiario = () => {
  const hoy = new Date().toISOString().split('T')[0];
  return getResumenDia(hoy).then(res => ({
    data: {
      total_ventas: res.data.mañana.totalVentas + res.data.tarde.totalVentas,
      total_gastos: res.data.mañana.totalGastos + res.data.tarde.totalGastos,
      ganancia_neta: (res.data.mañana.ganancia + res.data.tarde.ganancia)
    }
  }));
};