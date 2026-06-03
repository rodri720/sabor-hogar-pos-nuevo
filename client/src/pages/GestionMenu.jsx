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
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '2rem 1rem', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: '600', marginBottom: '1.5rem', color: '#1e293b' }}>🍽️ Gestión del Menú</h1>

      {/* Botones de acción */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
        <button
          onClick={() => { setTipo('producto'); setEditando(null); setForm({ nombre: '', precio: '', categoria: '', stock: '', unidad: '', consumoPorUnidad: '' }); }}
          style={{ padding: '0.6rem 1.2rem', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}
          onMouseEnter={e => e.target.style.background = '#2563eb'}
          onMouseLeave={e => e.target.style.background = '#3b82f6'}
        >
          + Nuevo Producto
        </button>
        <button
          onClick={() => { setTipo('combo'); setEditando(null); setForm({ nombre: '', precio: '' }); }}
          style={{ padding: '0.6rem 1.2rem', background: '#10b981', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}
          onMouseEnter={e => e.target.style.background = '#059669'}
          onMouseLeave={e => e.target.style.background = '#10b981'}
        >
          + Nuevo Combo
        </button>
      </div>

      {/* Formulario */}
      <div style={{ background: '#f8fafc', borderRadius: '1rem', padding: '1.5rem', marginBottom: '2rem', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem', color: '#0f172a' }}>
          {editando ? '✏️ Editar' : '✨ Crear'} {tipo === 'producto' ? 'Producto' : 'Combo'}
        </h2>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gap: '1rem', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))' }}>
            <input
              placeholder="Nombre"
              value={form.nombre || ''}
              onChange={e => setForm({ ...form, nombre: e.target.value })}
              required
              style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
            <input
              placeholder="Precio"
              type="number"
              step="0.01"
              value={form.precio || ''}
              onChange={e => setForm({ ...form, precio: e.target.value })}
              required
              style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
            />
            {tipo === 'producto' && (
              <>
                <input
                  placeholder="Categoría"
                  value={form.categoria || ''}
                  onChange={e => setForm({ ...form, categoria: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <input
                  placeholder="Stock inicial"
                  type="number"
                  value={form.stock || ''}
                  onChange={e => setForm({ ...form, stock: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <input
                  placeholder="Unidad (gr, ml, unidad)"
                  value={form.unidad || ''}
                  onChange={e => setForm({ ...form, unidad: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
                <input
                  placeholder="Consumo por porción"
                  type="number"
                  value={form.consumoPorUnidad || ''}
                  onChange={e => setForm({ ...form, consumoPorUnidad: e.target.value })}
                  style={{ padding: '0.6rem', borderRadius: '0.5rem', border: '1px solid #cbd5e1', fontSize: '0.9rem' }}
                />
              </>
            )}
          </div>
          <div style={{ display: 'flex', gap: '0.8rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              style={{ padding: '0.6rem 1.2rem', background: '#0f172a', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer', transition: '0.2s' }}
              onMouseEnter={e => e.target.style.background = '#1e293b'}
              onMouseLeave={e => e.target.style.background = '#0f172a'}
            >
              {editando ? 'Actualizar' : 'Guardar'}
            </button>
            {editando && (
              <button
                type="button"
                onClick={() => { setEditando(null); setForm({}); }}
                style={{ padding: '0.6rem 1.2rem', background: '#64748b', color: 'white', border: 'none', borderRadius: '0.5rem', fontWeight: '500', cursor: 'pointer' }}
                onMouseEnter={e => e.target.style.background = '#475569'}
                onMouseLeave={e => e.target.style.background = '#64748b'}
              >
                Cancelar
              </button>
            )}
          </div>
        </form>
      </div>

      {/* Listado de Productos y Combos */}
      <div style={{ display: 'grid', gap: '2rem', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))' }}>
        {/* Productos */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>📦 Productos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Categoría</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Stock</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {productos.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{p.nombre}</td>
                    <td style={{ padding: '0.75rem' }}>${p.precio}</td>
                    <td style={{ padding: '0.75rem' }}>{p.categoria || '—'}</td>
                    <td style={{ padding: '0.75rem' }}>{p.stock} {p.unidad}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleEdit(p, 'producto')}
                        style={{ background: '#3b82f6', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', color: 'white', cursor: 'pointer', marginRight: '0.5rem' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(p.id, 'producto')}
                        style={{ background: '#ef4444', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', color: 'white', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {productos.length === 0 && (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay productos cargados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Combos */}
        <div style={{ background: 'white', borderRadius: '1rem', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
          <div style={{ background: '#f1f5f9', padding: '1rem', borderBottom: '1px solid #e2e8f0' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: '600', margin: 0, color: '#0f172a' }}>🧩 Combos</h2>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Nombre</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Precio</th>
                  <th style={{ padding: '0.75rem', textAlign: 'left' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {combos.map(c => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                    <td style={{ padding: '0.75rem' }}>{c.nombre}</td>
                    <td style={{ padding: '0.75rem' }}>${c.precio}</td>
                    <td style={{ padding: '0.75rem' }}>
                      <button
                        onClick={() => handleEdit(c, 'combo')}
                        style={{ background: '#3b82f6', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', color: 'white', cursor: 'pointer', marginRight: '0.5rem' }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(c.id, 'combo')}
                        style={{ background: '#ef4444', border: 'none', borderRadius: '0.375rem', padding: '0.25rem 0.75rem', color: 'white', cursor: 'pointer' }}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
                {combos.length === 0 && (
                  <tr><td colSpan="3" style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay combos cargados.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}