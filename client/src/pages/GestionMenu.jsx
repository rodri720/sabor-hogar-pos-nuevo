import { useState, useEffect } from 'react';
import { getProductos, getCombos, crearProducto, actualizarProducto, eliminarProducto, crearCombo, actualizarCombo, eliminarCombo } from '../api';

export default function GestionMenu() {
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);
  const [editando, setEditando] = useState(null);
  const [tipo, setTipo] = useState('producto');
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', stock: '', unidad: '', consumoPorUnidad: '' });

  const cargarDatos = () => {
    Promise.all([getProductos(), getCombos()]).then(([p, c]) => {
      setProductos(p.data);
      setCombos(c.data);
    });
  };

  useEffect(() => { cargarDatos(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (tipo === 'producto') {
      if (editando) {
        await actualizarProducto(editando.id, form);
      } else {
        await crearProducto(form);
      }
    } else {
      if (editando) {
        await actualizarCombo(editando.id, form);
      } else {
        await crearCombo(form);
      }
    }
    setEditando(null);
    setForm({ nombre: '', precio: '', categoria: '', stock: '', unidad: '', consumoPorUnidad: '' });
    cargarDatos();
  };

  const handleEdit = (item, tipoItem) => {
    setTipo(tipoItem);
    setEditando(item);
    setForm(item);
  };

  const handleDelete = async (id, tipoItem) => {
    if (window.confirm('¿Eliminar este elemento?')) {
      if (tipoItem === 'producto') await eliminarProducto(id);
      else await eliminarCombo(id);
      cargarDatos();
    }
  };

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Gestión de Menú</h1>
      
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => { setTipo('producto'); setEditando(null); setForm({ nombre: '', precio: '', categoria: '', stock: '', unidad: '', consumoPorUnidad: '' }); }} style={{ marginRight: '1rem', padding: '0.5rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Nuevo Producto</button>
        <button onClick={() => { setTipo('combo'); setEditando(null); setForm({ nombre: '', precio: '' }); }} style={{ padding: '0.5rem 1rem', background: '#198754', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Nuevo Combo</button>
      </div>

      <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', padding: '1rem', border: '1px solid #ccc', borderRadius: '0.5rem' }}>
        <h3>{editando ? 'Editar' : 'Crear'} {tipo === 'producto' ? 'Producto' : 'Combo'}</h3>
        <div style={{ display: 'grid', gap: '0.5rem', gridTemplateColumns: 'repeat(auto-fill, minmax(200px,1fr))' }}>
          <input placeholder="Nombre" value={form.nombre || ''} onChange={e => setForm({ ...form, nombre: e.target.value })} required style={{ padding: '0.5rem' }} />
          <input placeholder="Precio" type="number" value={form.precio || ''} onChange={e => setForm({ ...form, precio: e.target.value })} required style={{ padding: '0.5rem' }} />
          {tipo === 'producto' && (
            <>
              <input placeholder="Categoría" value={form.categoria || ''} onChange={e => setForm({ ...form, categoria: e.target.value })} style={{ padding: '0.5rem' }} />
              <input placeholder="Stock inicial (gr/ml/unidad)" type="number" value={form.stock || ''} onChange={e => setForm({ ...form, stock: e.target.value })} style={{ padding: '0.5rem' }} />
              <input placeholder="Unidad (gr, ml, unidad)" value={form.unidad || ''} onChange={e => setForm({ ...form, unidad: e.target.value })} style={{ padding: '0.5rem' }} />
              <input placeholder="Consumo por porción" type="number" value={form.consumoPorUnidad || ''} onChange={e => setForm({ ...form, consumoPorUnidad: e.target.value })} style={{ padding: '0.5rem' }} />
            </>
          )}
        </div>
        <button type="submit" style={{ marginTop: '1rem', padding: '0.5rem 1rem', background: '#0d6efd', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Guardar</button>
        {editando && <button type="button" onClick={() => { setEditando(null); setForm({}); }} style={{ marginLeft: '0.5rem', padding: '0.5rem 1rem', background: '#6c757d', color: 'white', border: 'none', borderRadius: '0.25rem' }}>Cancelar</button>}
      </form>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <h2>Productos</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr></thead>
            <tbody>
              {productos.map(p => (
                <tr key={p.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{p.nombre}</td><td>${p.precio}</td><td>{p.categoria}</td>
                  <td>{p.stock} {p.unidad}</td>
                  <td><button onClick={() => handleEdit(p, 'producto')}>Editar</button> <button onClick={() => handleDelete(p.id, 'producto')}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <h2>Combos</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead><tr><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
            <tbody>
              {combos.map(c => (
                <tr key={c.id} style={{ borderBottom: '1px solid #ccc' }}>
                  <td>{c.nombre}</td><td>${c.precio}</td>
                  <td><button onClick={() => handleEdit(c, 'combo')}>Editar</button> <button onClick={() => handleDelete(c.id, 'combo')}>Eliminar</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}