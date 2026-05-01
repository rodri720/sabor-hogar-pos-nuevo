import { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Alert } from 'react-bootstrap';
import { getMesas, crearMesa, actualizarMesa, eliminarMesa } from '../../api';

export default function AdminMesas() {
  const [mesas, setMesas] = useState([]); const [show, setShow] = useState(false); const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ numero: '', capacidad: 4 }); const [error, setError] = useState('');
  const cargar = () => getMesas().then(res => setMesas(res.data));
  useEffect(() => { cargar(); }, []);
  const handleSave = async () => { if(!form.numero) return setError('Número requerido'); try{ if(editando) await actualizarMesa(editando.id, form); else await crearMesa(form); cargar(); setShow(false); setEditando(null); setForm({ numero: '', capacidad: 4 }); setError(''); } catch { setError('Error'); } };
  const handleEdit = (m) => { setEditando(m); setForm({ numero: m.numero, capacidad: m.capacidad }); setShow(true); };
  const handleDelete = async (id) => { if(confirm('¿Eliminar?')){ await eliminarMesa(id); cargar(); } };
  return (<><div className="d-flex justify-content-between mb-3"><h3>Mesas</h3><Button onClick={()=>{ setEditando(null); setForm({ numero: '', capacidad: 4 }); setShow(true); }}>➕ Nueva Mesa</Button></div>
    <Table striped bordered hover><thead><tr><th>ID</th><th>Número</th><th>Capacidad</th><th>Estado</th><th>Acciones</th></tr></thead>
    <tbody>{mesas.map(m => <tr key={m.id}><td>{m.id}</td><td>{m.numero}</td><td>{m.capacidad}</td><td>{m.estado}</td><td><Button size="sm" variant="warning" onClick={()=>handleEdit(m)}>Editar</Button> <Button size="sm" variant="danger" onClick={()=>handleDelete(m.id)}>Eliminar</Button></td></tr>)}</tbody></Table>
    <Modal show={show} onHide={()=>setShow(false)}><Modal.Header closeButton><Modal.Title>{editando ? 'Editar Mesa' : 'Nueva Mesa'}</Modal.Title></Modal.Header>
    <Modal.Body>{error && <Alert variant="danger">{error}</Alert>}<Form.Group><Form.Label>Número</Form.Label><Form.Control type="number" value={form.numero} onChange={e=>setForm({...form, numero: e.target.value})} /></Form.Group><Form.Group><Form.Label>Capacidad</Form.Label><Form.Control type="number" value={form.capacidad} onChange={e=>setForm({...form, capacidad: e.target.value})} /></Form.Group></Modal.Body>
    <Modal.Footer><Button variant="secondary" onClick={()=>setShow(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave}>Guardar</Button></Modal.Footer></Modal></>);
}
