import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert, Row, Col } from 'react-bootstrap';
import { getProductos, crearProducto, actualizarProducto, eliminarProducto } from '../../api';

export default function AdminProductos() {
  const [productos, setProductos] = useState([]); const [show, setShow] = useState(false); const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '', categoria: '', stock_actual: 0 }); const [error, setError] = useState('');
  const cargar = () => getProductos().then(res => setProductos(res.data));
  useEffect(() => { cargar(); }, []);
  const categorias = [...new Set(productos.map(p => p.categoria))];
  const handleSave = async () => { if(!form.nombre || !form.precio || !form.categoria) return setError('Complete campos'); try{ const data = { ...form, precio: parseFloat(form.precio), stock_actual: parseInt(form.stock_actual) }; if(editando) await actualizarProducto(editando.id, data); else await crearProducto(data); cargar(); setShow(false); setEditando(null); setForm({ nombre: '', precio: '', categoria: '', stock_actual: 0 }); setError(''); } catch { setError('Error'); } };
  const handleEdit = (p) => { setEditando(p); setForm({ nombre: p.nombre, precio: p.precio, categoria: p.categoria, stock_actual: p.stock_actual }); setShow(true); };
  const handleDelete = async (id) => { if(confirm('¿Eliminar?')){ await eliminarProducto(id); cargar(); } };
  return (<><div className="d-flex justify-content-between mb-3"><h3>Productos</h3><Button onClick={()=>{ setEditando(null); setForm({ nombre: '', precio: '', categoria: '', stock_actual: 0 }); setShow(true); }}>➕ Nuevo Producto</Button></div>
    <Table striped bordered hover><thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Categoría</th><th>Stock</th><th>Acciones</th></tr></thead>
    <tbody>{productos.map(p => <tr key={p.id}><td>{p.id}</td><td>{p.nombre}</td><td>${p.precio}</td><td>{p.categoria}</td><td>{p.stock_actual}</td><td><Button size="sm" variant="warning" onClick={()=>handleEdit(p)}>Editar</Button> <Button size="sm" variant="danger" onClick={()=>handleDelete(p.id)}>Eliminar</Button></td></tr>)}</tbody></Table>
    <Modal show={show} onHide={()=>setShow(false)} size="lg"><Modal.Header closeButton><Modal.Title>{editando ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title></Modal.Header>
    <Modal.Body>{error && <Alert variant="danger">{error}</Alert>}<Row><Col><Form.Group><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} /></Form.Group></Col><Col><Form.Group><Form.Label>Precio</Form.Label><Form.Control type="number" step="0.01" value={form.precio} onChange={e=>setForm({...form, precio: e.target.value})} /></Form.Group></Col></Row>
    <Row className="mt-2"><Col><Form.Group><Form.Label>Categoría</Form.Label><Form.Select value={form.categoria} onChange={e=>setForm({...form, categoria: e.target.value})}><option value="">Seleccionar</option>{categorias.map(c=> <option key={c}>{c}</option>)}</Form.Select></Form.Group></Col><Col><Form.Group><Form.Label>Stock actual</Form.Label><Form.Control type="number" value={form.stock_actual} onChange={e=>setForm({...form, stock_actual: e.target.value})} /></Form.Group></Col></Row></Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setShow(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>Guardar</Button></Modal.Footer></Modal></>);
}
