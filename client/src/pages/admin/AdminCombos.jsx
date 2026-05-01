import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getCombos, crearCombo, actualizarCombo, eliminarCombo } from '../../api';

export default function AdminCombos() {
  const [combos, setCombos] = useState([]); const [show, setShow] = useState(false); const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', precio: '' }); const [error, setError] = useState('');
  const cargar = () => getCombos().then(res => setCombos(res.data));
  useEffect(() => { cargar(); }, []);
  const handleSave = async () => { if(!form.nombre || !form.precio) return setError('Complete campos'); try{ const data = { ...form, precio: parseFloat(form.precio) }; if(editando) await actualizarCombo(editando.id, data); else await crearCombo(data); cargar(); setShow(false); setEditando(null); setForm({ nombre: '', precio: '' }); setError(''); } catch { setError('Error'); } };
  const handleEdit = (c) => { setEditando(c); setForm({ nombre: c.nombre, precio: c.precio }); setShow(true); };
  const handleDelete = async (id) => { if(confirm('¿Eliminar?')){ await eliminarCombo(id); cargar(); } };
  return (<><div className="d-flex justify-content-between mb-3"><h3>Combos</h3><Button onClick={()=>{ setEditando(null); setForm({ nombre: '', precio: '' }); setShow(true); }}>➕ Nuevo Combo</Button></div>
    <Table striped bordered hover><thead><tr><th>ID</th><th>Nombre</th><th>Precio</th><th>Acciones</th></tr></thead>
    <tbody>{combos.map(c => <tr key={c.id}><td>{c.id}</td><td>{c.nombre}</td><td>${c.precio}</td><td><Button size="sm" variant="warning" onClick={()=>handleEdit(c)}>Editar</Button> <Button size="sm" variant="danger" onClick={()=>handleDelete(c.id)}>Eliminar</Button></td></tr>)}</tbody></Table>
    <Modal show={show} onHide={()=>setShow(false)}><Modal.Header closeButton><Modal.Title>{editando ? 'Editar Combo' : 'Nuevo Combo'}</Modal.Title></Modal.Header>
    <Modal.Body>{error && <Alert variant="danger">{error}</Alert>}<Form.Group><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} /></Form.Group><Form.Group><Form.Label>Precio</Form.Label><Form.Control type="number" step="0.01" value={form.precio} onChange={e=>setForm({...form, precio: e.target.value})} /></Form.Group></Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setShow(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>Guardar</Button></Modal.Footer></Modal></>);
}
