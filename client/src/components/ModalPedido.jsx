import { useState, useEffect } from 'react';
import { getProductos, getCombos, crearVenta, cerrarVenta } from '../api';

export default function ModalPedido({ mesa, mozos, onClose, onPedidoCreado }) {
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mozoId, setMozoId] = useState(mesa.mozo_id || '');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [ventaId, setVentaId] = useState(null);

 useEffect(() => {
  const fetchData = async () => {
    const prodRes = await getProductos();
    const comboRes = await getCombos();
    setProductos(Array.isArray(prodRes.data) ? prodRes.data : []);
    setCombos(Array.isArray(comboRes.data) ? comboRes.data : []);
  };
  fetchData();
}, []);

  const agregarItem = (item, tipo) => {
    const existente = carrito.find(i => i.id === item.id && i.tipo === tipo);
    if (existente) {
      setCarrito(carrito.map(i => i.id === item.id && i.tipo === tipo ? { ...i, cantidad: i.cantidad + 1 } : i));
    } else {
      setCarrito([...carrito, { ...item, tipo, cantidad: 1, precio_unitario: item.precio }]);
    }
  };

  const calcularTotal = () => {
    return carrito.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
  };

  const finalizarVenta = async () => {
    if (!mozoId) return alert('Seleccione un mozo');
    const itemsParaAPI = carrito.map(i => ({
      producto_id: i.tipo === 'producto' ? i.id : null,
      combo_id: i.tipo === 'combo' ? i.id : null,
      cantidad: i.cantidad,
      precio_unitario: i.precio_unitario
    }));
    const data = {
      mesa_id: mesa.id,
      mozo_id: mozoId,
      items: itemsParaAPI,
      metodo_pago: metodoPago
    };
    try {
      const res = await crearVenta(data);
      alert(`Venta creada. Total: $${res.data.total}`);
      onPedidoCreado();
    } catch (error) {
      console.error(error);
      alert('Error al guardar venta');
    }
  };

  const cerrarMesa = async () => {
    if (!ventaId) return alert('No hay venta abierta');
    await cerrarVenta(ventaId);
    alert('Mesa cerrada, pedido finalizado');
    onPedidoCreado();
  };

  return (
    <div style={{ position: 'fixed', top: '10%', left: '10%', width: '80%', background: 'white', padding: '2rem', zIndex: 1000, overflow: 'auto' }}>
      <button onClick={onClose}>Cerrar</button>
      <h2>Mesa {mesa.numero}</h2>
      <label>Mozo: 
        <select value={mozoId} onChange={e => setMozoId(e.target.value)}>
          <option value="">Seleccionar</option>
          {mozos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
        </select>
      </label>
      <div style={{ display: 'flex' }}>
        <div style={{ flex: 1 }}>
          <h3>Productos</h3>
          {productos.map(p => (
            <div key={p.id}>
              {p.nombre} - ${p.precio} (stock: {p.stock_actual})
              <button onClick={() => agregarItem(p, 'producto')}>+</button>
            </div>
          ))}
          <h3>Combos</h3>
          {combos.map(c => (
            <div key={c.id}>
              {c.nombre} - ${c.precio}
              <button onClick={() => agregarItem(c, 'combo')}>+</button>
            </div>
          ))}
        </div>
        <div style={{ flex: 1 }}>
          <h3>Pedido actual</h3>
          {carrito.map((item, idx) => (
            <div key={idx}>
              {item.nombre} x{item.cantidad} = ${item.cantidad * item.precio_unitario}
              <button onClick={() => setCarrito(carrito.filter((_, i) => i !== idx))}>❌</button>
            </div>
          ))}
          <p><strong>Total: ${calcularTotal()}</strong></p>
          <label>Método de pago:
            <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)}>
              <option>efectivo</option><option>qr</option><option>transferencia</option><option>debito</option>
            </select>
          </label>
          <button onClick={finalizarVenta}>Guardar pedido</button>
          {ventaId && <button onClick={cerrarMesa}>Cerrar mesa</button>}
        </div>
      </div>
    </div>
  );
}