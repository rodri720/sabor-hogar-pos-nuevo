import axios from 'axios';

const API = axios.create({ baseURL: import.meta.env.VITE_API_URL });

// Datos mock para probar (solo mientras no exista backend)
const mockMesas = Array.from({ length: 15 }, (_, i) => ({
  id: i + 1,
  numero: i + 1,
  estado: i === 0 ? 'ocupada' : 'libre',
  mozo_id: i === 0 ? 1 : null,
  mozo_nombre: i === 0 ? 'Mozo 1' : null,
}));

const mockMozos = [
  { id: 1, nombre: 'Mozo 1', codigo: 1 },
  { id: 2, nombre: 'Mozo 2', codigo: 2 },
  { id: 3, nombre: 'Mozo 3', codigo: 3 },
  { id: 4, nombre: 'Mozo 4', codigo: 4 },
  { id: 5, nombre: 'Mozo 5', codigo: 5 },
];

// Exportaciones con fallback a mock si el backend falla
export const getMesas = async () => {
  try {
    const res = await API.get('/mesas');
    // Si la respuesta es un array directamente, lo envolvemos en {data}
    return Array.isArray(res.data) ? { data: res.data } : res;
  } catch (error) {
    console.warn('Backend no disponible, usando datos mock de mesas');
    return { data: mockMesas };
  }
};

export const getMozos = async () => {
  try {
    const res = await API.get('/mozos');
    return Array.isArray(res.data) ? { data: res.data } : res;
  } catch (error) {
    console.warn('Backend no disponible, usando datos mock de mozos');
    return { data: mockMozos };
  }
};

// El resto de funciones (getProductos, crearVenta, etc.) también pueden tener mock
export const getProductos = async () => {
  try {
    const res = await API.get('/productos');
    return res;
  } catch (error) {
    // Mock básico de productos
    return { data: [] };
  }
};

export const getCombos = async () => {
  try {
    const res = await API.get('/combos');
    return res;
  } catch (error) {
    return { data: [] };
  }
};

export const crearVenta = (data) => API.post('/ventas', data);
export const cerrarVenta = (id) => API.post(`/ventas/${id}/cerrar`);
export const getVentasPorFecha = (fecha) => API.get(`/ventas?fecha=${fecha}`);
export const getGastos = (fecha) => API.get(`/gastos?fecha=${fecha}`);
export const crearGasto = (data) => API.post('/gastos', data);
export const getCierreDiario = (fecha) => API.get(`/cierre?fecha=${fecha}`);