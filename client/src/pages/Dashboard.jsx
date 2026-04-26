import { useState, useEffect } from 'react';
import { getMesas, getMozos } from '../api';
import ModalPedido from '../components/ModalPedido';
import QRCode from 'react-qr-code'; // Cambiado

export default function Dashboard() {
  const [mesas, setMesas] = useState([]);
  const [mozos, setMozos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mesaSeleccionada, setMesaSeleccionada] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    setLoading(true);
    try {
      const [mesasRes, mozosRes] = await Promise.all([getMesas(), getMozos()]);
      // Asegurar que sea array
      const mesasArray = Array.isArray(mesasRes.data) ? mesasRes.data : [];
      const mozosArray = Array.isArray(mozosRes.data) ? mozosRes.data : [];
      setMesas(mesasArray);
      setMozos(mozosArray);
    } catch (error) {
      console.error('Error cargando datos:', error);
      setMesas([]);
      setMozos([]);
    } finally {
      setLoading(false);
    }
  };

  const abrirModal = (mesa) => {
    setMesaSeleccionada(mesa);
    setShowModal(true);
  };

  const onPedidoCreado = () => {
    cargarDatos(); // recargar mesas
    setShowModal(false);
  };

  if (loading) return <div>Cargando mesas...</div>;

  return (
    <div>
      <h1>Panel de Control - Sabor Hogar</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
        {mesas.map(mesa => (
          <div key={mesa.id} style={{ border: '1px solid #ccc', padding: '1rem', textAlign: 'center' }}>
            <h3>Mesa {mesa.numero}</h3>
            <p>Estado: {mesa.estado || 'libre'}</p>
            {mesa.estado === 'ocupada' && <p>Mozo: {mesa.mozo_nombre || 'N/A'}</p>}
            <button onClick={() => abrirModal(mesa)}>
              {mesa.estado === 'libre' ? 'Abrir Pedido' : 'Ver Pedido'}
            </button>
            <div style={{ marginTop: '0.5rem' }}>
              <QRCode value={`${window.location.origin}/mesa/${mesa.numero}`} size={80} />
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <ModalPedido
          mesa={mesaSeleccionada}
          mozos={mozos}
          onClose={() => setShowModal(false)}
          onPedidoCreado={onPedidoCreado}
        />
      )}
    </div>
  );
}