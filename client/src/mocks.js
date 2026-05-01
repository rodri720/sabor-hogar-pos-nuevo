// ========== PRODUCTOS REALES ==========
export const productosMock = [
  { id: 1, nombre: 'Café Chico', precio: 2700, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 10 },
  { id: 2, nombre: 'Café Jarrito', precio: 3500, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 12 },
  { id: 3, nombre: 'Café Doble', precio: 4500, categoria: 'Café', stock: 5000, unidad: 'gr', consumoPorUnidad: 15 },
  { id: 4, nombre: 'Capuchino Chico', precio: 4000, categoria: 'Especiales', stock: 4000, unidad: 'ml', consumoPorUnidad: 250 },
  { id: 5, nombre: 'Capuchino Grande', precio: 5000, categoria: 'Especiales', stock: 4000, unidad: 'ml', consumoPorUnidad: 350 },
  { id: 6, nombre: 'Submarino Chico', precio: 4000, categoria: 'Especiales', stock: 3000, unidad: 'ml', consumoPorUnidad: 200 },
  { id: 7, nombre: 'Submarino Grande', precio: 4800, categoria: 'Especiales', stock: 3000, unidad: 'ml', consumoPorUnidad: 300 },
  { id: 8, nombre: '2 Licuados + Tostados', precio: 13500, categoria: 'Promo', stock: 20, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 9, nombre: 'Sándwich de Miga', precio: 2500, categoria: 'Comidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 10, nombre: 'Agua saborizada Fresh', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 11, nombre: 'Agua mineral Villavicencio', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 12, nombre: 'Gaseosa Pepsi', precio: 1300, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 13, nombre: 'Gaseosa Coca-Cola', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 14, nombre: 'Fanta Naranja', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 15, nombre: 'Sprite', precio: 1800, categoria: 'Bebidas', stock: 100, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 16, nombre: 'Gatorade', precio: 2400, categoria: 'Bebidas', stock: 80, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 17, nombre: 'Jugo Baggio', precio: 1000, categoria: 'Bebidas', stock: 150, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 18, nombre: 'Yogurt Mamfrey', precio: 1500, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 19, nombre: 'Yogurt Ilolay', precio: 1200, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 20, nombre: 'Yogurt La Serenísima', precio: 1200, categoria: 'Bebidas', stock: 60, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 21, nombre: 'Monster (amarillo)', precio: 3500, categoria: 'Bebidas', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 22, nombre: 'Alfajor de maicena', precio: 500, categoria: 'Dulces y Porciones', stock: 200, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 23, nombre: 'Porción de torta', precio: 6000, categoria: 'Dulces y Porciones', stock: 30, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 24, nombre: 'Porción de tarta', precio: 4500, categoria: 'Dulces y Porciones', stock: 30, unidad: 'porción', consumoPorUnidad: 1 },
  { id: 25, nombre: 'Mini tarta', precio: 6000, categoria: 'Dulces y Porciones', stock: 20, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 26, nombre: 'Budín mini', precio: 2500, categoria: 'Dulces y Porciones', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 },
  { id: 27, nombre: 'Budín', precio: 4000, categoria: 'Dulces y Porciones', stock: 40, unidad: 'unidad', consumoPorUnidad: 1 }
];

// ========== COMBOS REALES ==========
export const combosMock = [
  { id: 1, nombre: 'Simple', precio: 5000, productos: [1, 10] },
  { id: 2, nombre: 'Light', precio: 9000, productos: [4, 9, 14] },
  { id: 3, nombre: 'Completo', precio: 7500, productos: [2, 9, 22] },
  { id: 4, nombre: 'Campestre', precio: 10000, productos: [5, 9, 11] },
  { id: 5, nombre: 'Fit', precio: 13000, productos: [6, 23, 16] },
  { id: 6, nombre: 'Fit Plus', precio: 14000, productos: [7, 24, 21] },
  { id: 7, nombre: 'Dulcero', precio: 9500, productos: [22, 23, 26, 27] }
];

// ========== MESAS (15) ==========
export const mesasMock = Array.from({ length: 15 }, (_, i) => ({
  id: i+1,
  numero: i+1,
  estado: i === 0 ? 'ocupada' : 'libre',
  mozo_id: i === 0 ? 1 : null,
  mozo_nombre: i === 0 ? 'Mozo 1' : null
}));

// ========== MOZOS (5) ==========
export const mozosMock = [
  { id: 1, nombre: 'Mozo 1', codigo: 1 },
  { id: 2, nombre: 'Mozo 2', codigo: 2 },
  { id: 3, nombre: 'Mozo 3', codigo: 3 },
  { id: 4, nombre: 'Mozo 4', codigo: 4 },
  { id: 5, nombre: 'Mozo 5', codigo: 5 }
];

// ========== INSUMOS PARA CONTROL DE STOCK ==========
export const insumosMock = [
  { id: 1, nombre: 'Café en grano', cantidad: 5000, unidad: 'gr', umbral: 1000 },
  { id: 2, nombre: 'Leche entera', cantidad: 5000, unidad: 'ml', umbral: 1000 },
  { id: 3, nombre: 'Harina', cantidad: 2000, unidad: 'gr', umbral: 500 },
  { id: 4, nombre: 'Azúcar', cantidad: 3000, unidad: 'gr', umbral: 500 },
  { id: 5, nombre: 'Jugo en polvo', cantidad: 2000, unidad: 'gr', umbral: 400 }
];

// ========== GASTOS REGISTRADOS ==========
export let gastosMock = [
  { id: 1, descripcion: 'Compra café', monto: 8000, fecha: '2025-04-30', categoria: 'insumos', turno: 'mañana' },
  { id: 2, descripcion: 'Sueldo empleados', monto: 30000, fecha: '2025-04-30', categoria: 'sueldos', turno: 'tarde' },
  { id: 3, descripcion: 'Mantenimiento máquina', monto: 5000, fecha: '2025-04-29', categoria: 'mantenimiento', turno: 'mañana' }
];

// ========== VENTAS ALMACENADAS (para reportes) ==========
export let ventasStorage = [
  { id: 1, mesa_id: 1, mozo_id: 1, items: [{ producto_id: 1, cantidad: 2, precio_unitario: 2700 }], metodo_pago: 'efectivo', total: 5400, fecha: '2025-04-30T10:30:00', turno: 'mañana', estado: 'cerrado' },
  { id: 2, mesa_id: 2, mozo_id: 2, items: [{ producto_id: 2, cantidad: 1, precio_unitario: 3500 }], metodo_pago: 'qr', total: 3500, fecha: '2025-04-30T16:00:00', turno: 'tarde', estado: 'cerrado' },
  { id: 3, mesa_id: 1, mozo_id: 1, items: [{ combo_id: 1, cantidad: 1, precio_unitario: 5000 }], metodo_pago: 'transferencia', total: 5000, fecha: '2025-04-30T09:00:00', turno: 'mañana', estado: 'cerrado' }
];

export let nextVentaId = 4;