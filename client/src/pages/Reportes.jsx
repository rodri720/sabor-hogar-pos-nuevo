import { useState } from 'react';
import { getResumenDia } from '../api';

export default function Reportes() {
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [reporte, setReporte] = useState(null);
  const [cargando, setCargando] = useState(false);

  const generarReporte = async () => {
    setCargando(true);
    try {
      const res = await getResumenDia(fecha);
      setReporte(res.data);
    } catch (err) {
      console.error(err);
      alert('Error al generar reporte');
    } finally {
      setCargando(false);
    }
  };

  const formatearMoneda = (num) => `$${num.toLocaleString()}`;

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Reportes de Facturación</h1>
      
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ padding: '0.5rem' }} />
        <button onClick={generarReporte} style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '0.25rem' }} disabled={cargando}>
          {cargando ? 'Cargando...' : 'Generar Reporte'}
        </button>
      </div>

      {reporte && (
        <div>
          {/* Turno Mañana */}
          <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ffc107', borderRadius: '0.5rem', background: '#fff3cd' }}>
            <h2 style={{ color: '#856404' }}>🌅 Turno Mañana</h2>
            <div><strong>Total Ventas:</strong> {formatearMoneda(reporte.mañana.totalVentas)}</div>
            <div><strong>Total Gastos:</strong> {formatearMoneda(reporte.mañana.totalGastos)}</div>
            <div><strong>💰 Ganancia Neta:</strong> {formatearMoneda(reporte.mañana.ganancia)}</div>
            <h4>Desglose por método de pago:</h4>
            <ul>
              <li>Efectivo: {formatearMoneda(reporte.mañana.porMetodo.efectivo)}</li>
              <li>QR: {formatearMoneda(reporte.mañana.porMetodo.qr)}</li>
              <li>Transferencia: {formatearMoneda(reporte.mañana.porMetodo.transferencia)}</li>
              <li>Débito: {formatearMoneda(reporte.mañana.porMetodo.debito)}</li>
              <li>Tarjeta: {formatearMoneda(reporte.mañana.porMetodo.tarjeta ?? 0)}</li>
            </ul>
          </div>

          {/* Turno Tarde */}
          <div style={{ padding: '1rem', border: '1px solid #17a2b8', borderRadius: '0.5rem', background: '#d1ecf1' }}>
            <h2 style={{ color: '#0c5460' }}>🌇 Turno Tarde</h2>
            <div><strong>Total Ventas:</strong> {formatearMoneda(reporte.tarde.totalVentas)}</div>
            <div><strong>Total Gastos:</strong> {formatearMoneda(reporte.tarde.totalGastos)}</div>
            <div><strong>💰 Ganancia Neta:</strong> {formatearMoneda(reporte.tarde.ganancia)}</div>
            <h4>Desglose por método de pago:</h4>
            <ul>
              <li>Efectivo: {formatearMoneda(reporte.tarde.porMetodo.efectivo)}</li>
              <li>QR: {formatearMoneda(reporte.tarde.porMetodo.qr)}</li>
              <li>Transferencia: {formatearMoneda(reporte.tarde.porMetodo.transferencia)}</li>
              <li>Débito: {formatearMoneda(reporte.tarde.porMetodo.debito)}</li>
              <li>Tarjeta: {formatearMoneda(reporte.tarde.porMetodo.tarjeta ?? 0)}</li>
            </ul>
          </div>

          {/* Totales del día */}
          <div style={{ marginTop: '2rem', padding: '1rem', background: '#e9ecef', borderRadius: '0.5rem' }}>
            <h3>📊 Resumen del día {fecha}</h3>
            <div><strong>Total Ventas:</strong> {formatearMoneda(reporte.mañana.totalVentas + reporte.tarde.totalVentas)}</div>
            <div><strong>Total Gastos:</strong> {formatearMoneda(reporte.mañana.totalGastos + reporte.tarde.totalGastos)}</div>
            <div><strong>🍾 Ganancia Total del Día:</strong> {formatearMoneda(reporte.mañana.ganancia + reporte.tarde.ganancia)}</div>
          </div>
        </div>
      )}
    </div>
  );
}