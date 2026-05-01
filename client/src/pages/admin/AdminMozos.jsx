import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getMozos, crearMozo, actualizarMozo, eliminarMozo } from '../../api';

export default function AdminMozos() {
  const [mozos, setMozos] = useState([]); const [show, setShow] = useState(false); const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', codigo: '' }); const [error, setError] = useState('');
  const cargar = () => getMozos().then(res => setMozos(res.data));
  useEffect(() => { cargar(); }, []);
  const handleSave = async () => { if(!form.nombre || !form.codigo) return setError('Complete campos'); try{ if(editando) await actualizarMozo(editando.id, form); else await crearMozo(form); cargar(); setShow(false); setEditando(null); setForm({ nombre: '', codigo: '' }); setError(''); } catch { setError('Error'); } };
  const handleEdit = (m) => { setEditando(m); setForm({ nombre: m.nombre, codigo: m.codigo }); setShow(true); };
  const handleDelete = async (id) => { if(confirm('¿Eliminar?')){ await eliminarMozo(id); cargar(); } };
  return (<><div className="d-flex justify-content-between mb-3"><h3>Mozos</h3><Button onClick={()=>{ setEditando(null); setForm({ nombre: '', codigo: '' }); setShow(true); }}>➕ Nuevo Mozo</Button></div>
    <Table striped bordered hover><thead><tr><th>ID</th><th>Nombre</th><th>Código</th><th>Acciones</th></tr></thead>
    <tbody>{mozos.map(m => <tr key={m.id}><td>{m.id}</td><td>{m.nombre}</td><td>{m.codigo}</td><td><Button size="sm" variant="warning" onClick={()=>handleEdit(m)}>Editar</Button> <Button size="sm" variant="danger" onClick={()=>handleDelete(m.id)}>Eliminar</Button></td></tr>)}</tbody></Table>
    <Modal show={show} onHide={()=>setShow(false)}><Modal.Header closeButton><Modal.Title>{editando ? 'Editar Mozo' : 'Nuevo Mozo'}</Modal.Title></Modal.Header>
    <Modal.Body>{error && <Alert variant="danger">{error}</Alert>}<Form.Group><Form.Label>Nombre</Form.Label><Form.Control value={form.nombre} onChange={e=>setForm({...form, nombre: e.target.value})} /></Form.Group><Form.Group><Form.Label>Código</Form.Label><Form.Control type="number" value={form.codigo} onChange={e=>setForm({...form, codigo: e.target.value})} /></Form.Group></Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setShow(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>Guardar</Button></Modal.Footer></Modal></>);
}
