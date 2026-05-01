import { useState, useEffect } from 'react';
import { getMesas, getMozos, getProductos, getCombos, crearVenta, cerrarVenta } from '../api';

export default function Dashboard() {
  const [mesas, setMesas] = useState([]);
  const [mozos, setMozos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  
  // Estado del modal
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mozoId, setMozoId] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');
  const [cargando, setCargando] = useState(false);
  const [ventaId, setVentaId] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getMesas(), getMozos()])
      .then(([resMesas, resMozos]) => {
        setMesas(resMesas.data);
        setMozos(resMozos.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error cargando datos:", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!showModal) return;
    Promise.all([getProductos(), getCombos()]).then(([p, c]) => {
      setProductos(p.data);
      setCombos(c.data);
    });
    setCarrito([]);
    setVentaId(null);
    setMozoId(mesaSeleccionada?.mozo_id || '');
    setMetodoPago('efectivo');
    setError('');
  }, [showModal, mesaSeleccionada]);

  const agregarItem = (item, tipo) => {
    const existente = carrito.find(i => i.id === item.id && i.tipo === tipo);
    if (existente) {
      setCarrito(carrito.map(i =>
        i.id === item.id && i.tipo === tipo ? { ...i, cantidad: i.cantidad + 1 } : i
      ));
    } else {
      setCarrito([...carrito, { ...item, tipo, cantidad: 1, precio_unitario: item.precio }]);
    }
  };

  const quitarItem = (id, tipo) => {
    const item = carrito.find(i => i.id === id && i.tipo === tipo);
    if (item?.cantidad === 1) {
      setCarrito(carrito.filter(i => !(i.id === id && i.tipo === tipo)));
    } else {
      setCarrito(carrito.map(i =>
        i.id === id && i.tipo === tipo ? { ...i, cantidad: i.cantidad - 1 } : i
      ));
    }
  };

  const eliminarItem = (id, tipo) => {
    setCarrito(carrito.filter(i => !(i.id === id && i.tipo === tipo)));
  };

  const calcularSubtotal = () => carrito.reduce((acc, i) => acc + i.cantidad * i.precio_unitario, 0);
  const calcularIVA = () => calcularSubtotal() * 0.21;
  const calcularTotal = () => calcularSubtotal() + calcularIVA();

  const handleGuardarPedido = async () => {
    if (!mozoId) return setError('Seleccione un mozo');
    if (carrito.length === 0) return setError('Agregue productos');
    setCargando(true);
    setError('');
    try {
      const items = carrito.map(item => ({
        producto_id: item.tipo === 'producto' ? item.id : null,
        combo_id: item.tipo === 'combo' ? item.id : null,
        cantidad: item.cantidad,
        precio_unitario: item.precio_unitario,
      }));
      const res = await crearVenta({ mesa_id: mesaSeleccionada.id, mozo_id: mozoId, items, metodo_pago: metodoPago });
      setVentaId(res.data.id);
      alert('Pedido guardado');
    } catch (err) {
      setError('Error al guardar');
    } finally {
      setCargando(false);
    }
  };

  const handleCerrarMesa = async () => {
    if (!ventaId) return setError('No hay pedido activo');
    setCargando(true);
    try {
      await cerrarVenta(ventaId);
      alert('Mesa cerrada');
      setShowModal(false);
      const [resMesas, resMozos] = await Promise.all([getMesas(), getMozos()]);
      setMesas(resMesas.data);
      setMozos(resMozos.data);
    } catch (err) {
      setError('Error al cerrar');
    } finally {
      setCargando(false);
    }
  };

  const productosPorCategoria = productos.reduce((acc, p) => {
    if (!acc[p.categoria]) acc[p.categoria] = [];
    acc[p.categoria].push(p);
    return acc;
  }, {});

  if (loading) {
    return <div style={{ textAlign: 'center', marginTop: '2rem' }}>Cargando...</div>;
  }

  return (
    <div style={{ padding: '1rem', background: '#f8f9fa', minHeight: '100vh' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#0d6efd' }}>🍽️ Sabor Hogar - POS</h1>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1rem' }}>
        {mesas.map(mesa => (
          <div key={mesa.id} style={{ border: `2px solid ${mesa.estado === 'ocupada' ? '#dc3545' : '#198754'}`, borderRadius: '0.5rem', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', padding: '1rem', textAlign: 'center' }}>
            <h3>Mesa {mesa.numero}</h3>
            <span style={{ display: 'inline-block', background: mesa.estado === 'ocupada' ? '#dc3545' : '#198754', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.8rem', marginBottom: '0.5rem' }}>
              {mesa.estado === 'ocupada' ? 'Ocupada' : 'Libre'}
            </span>
            {mesa.mozo_nombre && <p style={{ color: '#6c757d' }}>Mozo: {mesa.mozo_nombre}</p>}
            <button
              onClick={() => {
                setMesaSeleccionada(mesa);
                setShowModal(true);
              }}
              style={{ background: mesa.estado === 'libre' ? '#198754' : '#ffc107', color: 'white', border: 'none', padding: '0.5rem', width: '100%', borderRadius: '0.25rem', cursor: 'pointer', marginBottom: '0.5rem' }}
            >
              {mesa.estado === 'libre' ? 'Abrir Pedido' : 'Ver Pedido'}
            </button>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=80x80&data=${window.location.origin}/mesa/${mesa.numero}`} alt="QR" width="80" height="80" />
            </div>
          </div>
        ))}
      </div>

      {/* Modal integrado con HTML nativo */}
      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1050 }}>
          <div style={{ background: 'white', borderRadius: '0.5rem', width: '90%', maxWidth: '1200px', maxHeight: '90vh', overflow: 'auto', padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', paddingBottom: '0.5rem', marginBottom: '1rem' }}>
              <h2>Mesa {mesaSeleccionada?.numero}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            {error && <div style={{ background: '#f8d7da', color: '#721c24', padding: '0.75rem', borderRadius: '0.25rem', marginBottom: '1rem' }}>{error}</div>}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              {/* Columna izquierda: formulario */}
              <div>
                <h5>Mozo</h5>
                <select value={mozoId} onChange={e => setMozoId(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem', borderRadius: '0.25rem', border: '1px solid #ced4da' }}>
                  <option value="">Asignar mozo</option>
                  {mozos.map(m => <option key={m.id} value={m.id}>{m.nombre}</option>)}
                </select>
                <h5>Productos</h5>
                {Object.entries(productosPorCategoria).map(([cat, items]) => (
                  <div key={cat}>
                    <h6>{cat}</h6>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem', marginBottom: '1rem' }}>
                      {items.map(p => (
                        <button key={p.id} onClick={() => agregarItem(p, 'producto')} style={{ background: '#0d6efd', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                          {p.nombre} - ${p.precio}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
                <h5 className="mt-3">Combos</h5>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '0.5rem' }}>
                  {combos.map(c => (
                    <button key={c.id} onClick={() => agregarItem(c, 'combo')} style={{ background: '#198754', color: 'white', border: 'none', padding: '0.5rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                      {c.nombre} - ${c.precio}
                    </button>
                  ))}
                </div>
              </div>
              {/* Columna derecha: carrito */}
              <div>
                <h5>Carrito</h5>
                {carrito.length === 0 ? <p>Vacío</p> : (
                  <ul style={{ listStyle: 'none', padding: 0 }}>
                    {carrito.map((item, idx) => (
                      <li key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #dee2e6', padding: '0.5rem 0' }}>
                        <div>{item.nombre} x{item.cantidad}<br /><small>${(item.cantidad * item.precio_unitario).toLocaleString()}</small></div>
                        <div>
                          <button onClick={() => quitarItem(item.id, item.tipo)} style={{ margin: '0 0.25rem', padding: '0.25rem 0.5rem' }}>-</button>
                          <span>{item.cantidad}</span>
                          <button onClick={() => agregarItem(item, item.tipo)} style={{ margin: '0 0.25rem', padding: '0.25rem 0.5rem' }}>+</button>
                          <button onClick={() => eliminarItem(item.id, item.tipo)} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.25rem 0.5rem', borderRadius: '0.25rem' }}>🗑️</button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
                <hr />
                <div><strong>Subtotal:</strong> ${calcularSubtotal().toLocaleString()}</div>
                <div><strong>IVA (21%):</strong> ${calcularIVA().toLocaleString()}</div>
                <div className="h5"><strong>Total:</strong> ${calcularTotal().toLocaleString()}</div>
                <div style={{ marginTop: '1rem' }}>
                  <label>Método de pago</label>
                  <select value={metodoPago} onChange={e => setMetodoPago(e.target.value)} style={{ width: '100%', padding: '0.5rem', marginTop: '0.25rem' }}>
                    <option>efectivo</option><option>qr</option><option>transferencia</option><option>debito</option>
                  </select>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                  <button onClick={handleGuardarPedido} disabled={cargando} style={{ background: '#198754', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                    {cargando ? 'Guardando...' : 'Guardar Pedido'}
                  </button>
                  <button onClick={handleCerrarMesa} disabled={!ventaId || cargando} style={{ background: '#dc3545', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>
                    Cerrar Mesa
                  </button>
                </div>
              </div>
            </div>
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
              <button onClick={() => setShowModal(false)} style={{ background: '#6c757d', color: 'white', border: 'none', padding: '0.5rem 1rem', borderRadius: '0.25rem', cursor: 'pointer' }}>Cerrar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}