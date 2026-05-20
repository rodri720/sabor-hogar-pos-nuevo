import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Alert, Spinner, Modal } from 'react-bootstrap';
import { getInsumos, crearInsumo, actualizarInsumo, eliminarInsumo, reponerInsumo } from '../api';

export default function ControlStock() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Formulario de edición/creación
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({ nombre: '', cantidad: '', unidad: '', umbral: '' });
  const [saving, setSaving] = useState(false);

  // Reposición
  const [reposicion, setReposicion] = useState({ id: null, cantidad: 0 });
  const [reponiendo, setReponiendo] = useState(false);

  // Modal de confirmación para eliminar
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [insumoAEliminar, setInsumoAEliminar] = useState(null);

  const cargarDatos = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getInsumos();
      setInsumos(res.data);
    } catch (err) {
      setError('Error al cargar los insumos. Verifica la conexión con el servidor.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editando) {
        await actualizarInsumo(editando.id, form);
        setSuccess('Insumo actualizado correctamente');
      } else {
        await crearInsumo(form);
        setSuccess('Insumo creado correctamente');
      }
      setEditando(null);
      setForm({ nombre: '', cantidad: '', unidad: '', umbral: '' });
      cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al guardar el insumo');
    } finally {
      setSaving(false);
    }
  };

  const handleReponer = async () => {
    if (!reposicion.id || reposicion.cantidad <= 0) {
      setError('Selecciona un insumo y una cantidad válida');
      return;
    }
    setReponiendo(true);
    setError(null);
    try {
      await reponerInsumo(reposicion.id, Number(reposicion.cantidad));
      setSuccess('Stock actualizado correctamente');
      setReposicion({ id: null, cantidad: 0 });
      cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al reponer stock');
    } finally {
      setReponiendo(false);
    }
  };

  const confirmarEliminar = (insumo) => {
    setInsumoAEliminar(insumo);
    setShowDeleteModal(true);
  };

  const handleEliminar = async () => {
    if (!insumoAEliminar) return;
    setShowDeleteModal(false);
    setError(null);
    try {
      await eliminarInsumo(insumoAEliminar.id);
      setSuccess('Insumo eliminado correctamente');
      cargarDatos();
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al eliminar el insumo');
    } finally {
      setInsumoAEliminar(null);
    }
  };

  const handleEdit = (insumo) => {
    setEditando(insumo);
    setForm({
      nombre: insumo.nombre,
      cantidad: insumo.cantidad,
      unidad: insumo.unidad,
      umbral: insumo.umbral,
    });
  };

  return (
    <Container fluid className="py-4">
      <Row className="mb-4">
        <Col>
          <h1 className="text-warning">Control de Stock / Mercadería</h1>
          <p className="text-secondary">Gestioná tus insumos, reponé stock y controlá niveles mínimos.</p>
        </Col>
      </Row>

      {/* Mensajes de éxito/error */}
      {success && <Alert variant="success" onClose={() => setSuccess(null)} dismissible>{success}</Alert>}
      {error && <Alert variant="danger" onClose={() => setError(null)} dismissible>{error}</Alert>}

      <Row className="g-4">
        {/* Formulario de nuevo/editar insumo */}
        <Col md={5}>
          <Card className="panel-dark text-light h-100">
            <Card.Header className="border-secondary bg-transparent">
              <h5 className="mb-0">{editando ? '✏️ Editar Insumo' : '➕ Nuevo Insumo'}</h5>
            </Card.Header>
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Nombre del insumo</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Ej. Harina 000"
                    value={form.nombre}
                    onChange={e => setForm({ ...form, nombre: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Cantidad actual</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Ej. 25.5"
                    value={form.cantidad}
                    onChange={e => setForm({ ...form, cantidad: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Unidad de medida</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="kg, gr, l, ml, unid"
                    value={form.unidad}
                    onChange={e => setForm({ ...form, unidad: e.target.value })}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3">
                  <Form.Label>Stock mínimo (alerta)</Form.Label>
                  <Form.Control
                    type="number"
                    step="0.01"
                    placeholder="Ej. 5"
                    value={form.umbral}
                    onChange={e => setForm({ ...form, umbral: e.target.value })}
                    required
                  />
                </Form.Group>

                <div className="d-flex gap-2">
                  <Button variant="success" type="submit" disabled={saving}>
                    {saving ? <Spinner size="sm" animation="border" /> : 'Guardar'}
                  </Button>
                  {editando && (
                    <Button variant="secondary" onClick={() => { setEditando(null); setForm({ nombre: '', cantidad: '', unidad: '', umbral: '' }); }}>
                      Cancelar
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>
        </Col>

        {/* Reposición rápida */}
        <Col md={7}>
          <Card className="panel-dark text-light h-100">
            <Card.Header className="border-secondary bg-transparent">
              <h5 className="mb-0">📦 Reposición de stock</h5>
            </Card.Header>
            <Card.Body>
              <Row className="align-items-end g-2">
                <Col md={5}>
                  <Form.Label>Insumo</Form.Label>
                  <Form.Select
                    value={reposicion.id || ''}
                    onChange={e => setReposicion({ ...reposicion, id: Number(e.target.value) })}
                  >
                    <option value="">Seleccionar insumo</option>
                    {insumos.map(i => (
                      <option key={i.id} value={i.id}>
                        {i.nombre} (actual: {i.cantidad} {i.unidad})
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col md={4}>
                  <Form.Label>Cantidad a agregar</Form.Label>
                  <Form.Control
                    type="number"
                    min="0.01"
                    step="0.01"
                    placeholder="Ej. 10"
                    value={reposicion.cantidad}
                    onChange={e => setReposicion({ ...reposicion, cantidad: Number(e.target.value) })}
                  />
                </Col>
                <Col md={3}>
                  <Button variant="primary" onClick={handleReponer} disabled={reponiendo} className="w-100">
                    {reponiendo ? <Spinner size="sm" animation="border" /> : 'Reponer'}
                  </Button>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Tabla de insumos */}
      <Row className="mt-4">
        <Col>
          <Card className="panel-dark text-light">
            <Card.Header className="border-secondary bg-transparent">
              <h5 className="mb-0">Inventario actual</h5>
            </Card.Header>
            <Card.Body className="p-0">
              {loading ? (
                <div className="text-center py-4">
                  <Spinner animation="border" variant="light" />
                  <p className="mt-2">Cargando insumos...</p>
                </div>
              ) : (
                <Table responsive striped bordered hover variant="dark" className="mb-0">
                  <thead>
                    <tr>
                      <th>Insumo</th><th>Cantidad</th><th>Unidad</th><th>Mínimo</th><th>Estado</th><th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {insumos.length === 0 ? (
                      <tr><td colSpan="6" className="text-center">No hay insumos cargados.</td></tr>
                    ) : (
                      insumos.map(i => {
                        const isLow = i.cantidad <= i.umbral;
                        return (
                          <tr key={i.id} className={isLow ? 'table-danger' : ''}>
                            <td>{i.nombre}</td>
                            <td className="fw-bold">{i.cantidad}</td>
                            <td>{i.unidad}</td>
                            <td>{i.umbral}</td>
                            <td>{isLow ? '⚠️ Stock bajo' : '✅ Normal'}</td>
                            <td>
                              <Button size="sm" variant="outline-warning" onClick={() => handleEdit(i)} className="me-2">
                                Editar
                              </Button>
                              <Button size="sm" variant="outline-danger" onClick={() => confirmarEliminar(i)}>
                                Eliminar
                              </Button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </Table>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Modal de confirmación de eliminación */}
      <Modal show={showDeleteModal} onHide={() => setShowDeleteModal(false)} centered>
        <Modal.Header closeButton className="bg-dark text-light border-secondary">
          <Modal.Title>Confirmar eliminación</Modal.Title>
        </Modal.Header>
        <Modal.Body className="bg-dark text-light">
          ¿Estás seguro de que querés eliminar el insumo <strong>{insumoAEliminar?.nombre}</strong>?
          <br /> Esta acción no se puede deshacer.
        </Modal.Body>
        <Modal.Footer className="bg-dark border-secondary">
          <Button variant="secondary" onClick={() => setShowDeleteModal(false)}>Cancelar</Button>
          <Button variant="danger" onClick={handleEliminar}>Eliminar</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}