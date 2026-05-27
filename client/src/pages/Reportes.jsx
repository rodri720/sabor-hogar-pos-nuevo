import { useState } from 'react';
import { getResumenDia, getFacturasPorFecha, reemitirFacturas } from '../api';

export default function Reportes() {
  const [fecha, setFecha] = useState('2025-04-30');
  const [reporte, setReporte] = useState(null);
  const [facturas, setFacturas] = useState([]);
  const [cargando, setCargando] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const generarReporte = async () => {
    setCargando(true);
    try {
      const [resumenRes, facturasRes] = await Promise.all([
        getResumenDia(fecha),
        getFacturasPorFecha(fecha)
      ]);
      setReporte(resumenRes.data);
      setFacturas(facturasRes.data);
    } catch (err) {
      console.error(err);
      alert('Error al generar reporte');
    } finally {
      setCargando(false);
    }
  };

  const handleReenviar = async () => {
    if (!window.confirm(`¿Reenviar todas las facturas del día ${fecha} a ARCA?`)) return;
    setReenviando(true);
    try {
      const res = await reemitirFacturas(fecha);
      alert(res.message || `Se reenviaron ${res.facturas?.length || 0} facturas correctamente`);
      // Opcional: refrescar el reporte para ver si cambió algo
      await generarReporte();
    } catch (err) {
      alert('Error al reenviar facturas: ' + err.message);
    } finally {
      setReenviando(false);
    }
  };

  const formatearMoneda = (num) => `$${num.toLocaleString()}`;

  return (
    <div style={{ padding: '1rem', paddingBottom: '80px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Reportes de Facturación</h1>

      <div style={{ marginBottom: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
        <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} style={{ padding: '0.5rem' }} />
        <button onClick={generarReporte} disabled={cargando} style={{ padding: '0.5rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '0.25rem' }}>
          {cargando ? 'Cargando...' : 'Generar Reporte'}
        </button>
        <button onClick={handleReenviar} disabled={reenviando || facturas.length === 0} style={{ padding: '0.5rem 1rem', background: '#dc3545', color: 'white', border: 'none', borderRadius: '0.25rem' }}>
          {reenviando ? 'Reenviando...' : 'Reenviar facturas a ARCA'}
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

          {/* Listado de facturas con scroll */}
          {facturas.length > 0 && (
            <div style={{ marginTop: '2rem' }}>
              <h3>🧾 Facturas emitidas el {fecha}</h3>
              <div style={{ overflowX: 'auto', maxHeight: '400px', overflowY: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', background: '#fff', color: '#000' }}>
                  <thead style={{ position: 'sticky', top: 0, background: '#ddd' }}>
                    <tr>
                      <th>Nº Factura</th>
                      <th>CAE</th>
                      <th>Vencimiento CAE</th>
                      <th>Total</th>
                      <th>Punto Venta</th>
                      <th>Fecha Emisión</th>
                    </tr>
                  </thead>
                  <tbody>
                    {facturas.map(f => (
                      <tr key={f.id} style={{ borderBottom: '1px solid #ccc' }}>
                        <td>{f.numero}</td>
                        <td>{f.cae}</td>
                        <td>{new Date(f.vencimiento_cae).toLocaleDateString()}</td>
                        <td>${Number(f.total).toFixed(2)}</td>
                        <td>{f.punto_venta}</td>
                        <td>{new Date(f.created_at).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}