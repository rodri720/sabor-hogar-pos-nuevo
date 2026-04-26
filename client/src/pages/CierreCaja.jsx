import { useState, useEffect } from 'react';
import { getVentasPorFecha, getGastos, crearGasto, getCierreDiario } from '../api';

export default function CierreCaja() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '', categoria: '' });

  useEffect(() => {
    cargarDatos();
  }, [fecha]);

  const cargarDatos = async () => {
    const ventasRes = await getVentasPorFecha(fecha);
    const gastosRes = await getGastos(fecha);
    const cierreRes = await getCierreDiario(fecha);
    setVentas(ventasRes.data);
    setGastos(gastosRes.data);
    setResumen(cierreRes.data);
  };

  const handleAddGasto = async () => {
    await crearGasto({ ...nuevoGasto, fecha });
    cargarDatos();
    setNuevoGasto({ concepto: '', monto: '', categoria: '' });
  };

  const imprimir = () => {
    window.print();
  };

  return (
    <div>
      <h1>Cierre de Caja</h1>
      <input type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      <button onClick={imprimir}>Imprimir Reporte</button>

      <div>
        <h2>Resumen del día</h2>
        {resumen && (
          <>
            <p>Total Ventas: ${resumen.total_ventas}</p>
            <p>Total Gastos: ${resumen.total_gastos}</p>
            <p>Ganancia Neta: ${resumen.ganancia_neta}</p>
          </>
        )}
      </div>

      <div>
        <h2>Ventas del día</h2>
        <table border="1"><tbody>
          {ventas.map(v => (
            <tr key={v.id}><td>Factura #{v.numero_factura}</td><td>${v.total}</td><td>{v.metodo_pago}</td><td>{v.fecha}</td></tr>
          ))}
        </tbody></table>
      </div>

      <div>
        <h2>Gastos del día</h2>
        <ul>
          {gastos.map(g => <li key={g.id}>{g.concepto} - ${g.monto} ({g.categoria})</li>)}
        </ul>
        <h3>Agregar gasto</h3>
        <input placeholder="Concepto" value={nuevoGasto.concepto} onChange={e => setNuevoGasto({...nuevoGasto, concepto: e.target.value})} />
        <input placeholder="Monto" type="number" value={nuevoGasto.monto} onChange={e => setNuevoGasto({...nuevoGasto, monto: e.target.value})} />
        <input placeholder="Categoría" value={nuevoGasto.categoria} onChange={e => setNuevoGasto({...nuevoGasto, categoria: e.target.value})} />
        <button onClick={handleAddGasto}>Registrar Gasto</button>
      </div>
    </div>
  );
}