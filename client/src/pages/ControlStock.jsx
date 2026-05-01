import { useState, useEffect } from 'react';
import { getInsumos, crearInsumo, actualizarInsumo, eliminarInsumo, reponerInsumo } from '../api';

export default function ControlStock() {
  const [insumos, setInsumos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: '', umbral: '' });
  const [reposicion, setReposicion] = useState({ id: null, cantidad: 0 });

  const cargarDatos = () => {
    getInsumos().then(res => setInsumos(res.data));
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (editando) {
      await actualizarInsumo(editando.id, form);
    } else {
      await crearInsumo(form);
    }
    setEditando(null);
    setForm({ nombre: '', cantidad: '', unidad: '', umbral: '' });
    cargarDatos();
  };

  const handleReponer = async () => {
    if (reposicion.id && reposicion.cantidad > 0) {
      await reponerInsumo(reposicion.id, Number(reposicion.cantidad));
      setReposicion({ id: null, cantidad: 0 });
      cargarDatos();
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Eliminar insumo?')) {
      await eliminarInsumo(id);
      cargarDatos();
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1000px', margin: '0 auto' }}>
      <h1>Control de Stock / Mercadería</h1>
      
      {/* Formulario para agregar/editar */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
        <h3>{editando ? 'Editar' : 'Nuevo'} Insumo</h3>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(150px,1fr))' }}>
          <input placeholder="Nombre" value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} required style={{ padding: '0.5rem' }} />
          <input placeholder="Cantidad actual" type="number" value={form.cantidad} onChange={e => setForm({ ...form, cantidad: e.target.value })} required style={{ padding: '0.5rem' }} />
          <input placeholder="Unidad (gr, ml, unid)" value={form.unidad} onChange={e => setForm({ ...form, unidad: e.target.value })} required style={{ padding: '0.5rem' }} />
          <input placeholder="Stock mínimo (alerta)" type="number" value={form.umbral} onChange={e => setForm({ ...form, umbral: e.target.value })} required style={{ padding: '0.5rem' }} />
        </div>
        <button type="submit" style={{ marginTop: '0.5rem', padding: '0.5rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Guardar</button>
        {editando && <button type="button" onClick={() => { setEditando(null); setForm({}); }} style={{ marginLeft: '0.5rem' }}>Cancelar</button>}
      </form>

      {/* Reposición rápida */}
      <div style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
        <h3>Reposición de stock</h3>
        <select value={reposicion.id || ''} onChange={e => setReposicion({ ...reposicion, id: Number(e.target.value) })} style={{ padding: '0.5rem', marginRight: '0.5rem' }}>
          <option value="">Seleccionar insumo</option>
          {insumos.map(i => <option key={i.id} value={i.id}>{i.nombre} (actual: {i.cantidad} {i.unidad})</option>)}
        </select>
        <input type="number" placeholder="Cantidad a agregar" value={reposicion.cantidad} onChange={e => setReposicion({ ...reposicion, cantidad: Number(e.target.value) })} style={{ padding: '0.5rem', width: '150px', marginRight: '0.5rem' }} />
        <button onClick={handleReponer} style={{ padding: '0.5rem 1rem', background: '#198754', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Reponer</button>
      </div>

      {/* Tabla de insumos */}
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8f9fa' }}>
            <th>Insumo</th><th>Cantidad</th><th>Unidad</th><th>Mínimo</th><th>Estado</th><th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {insumos.map(i => (
            <tr key={i.id} style={{ borderBottom: '1px solid #ccc', background: i.cantidad <= i.umbral ? '#f8d7da' : 'white' }}>
              <td>{i.nombre}</td>
              <td>{i.cantidad}</td><td>{i.unidad}</td><td>{i.umbral}</td>
              <td>{i.cantidad <= i.umbral ? '⚠️ Stock bajo' : '✅ Normal'}</td>
              <td>
                <button onClick={() => { setEditando(i); setForm(i); }}>Editar</button>
                <button onClick={() => handleDelete(i.id)} style={{ marginLeft: '0.5rem', background: '#dc3545', color: 'white' }}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}