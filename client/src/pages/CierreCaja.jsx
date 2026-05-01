import { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Form } from 'react-bootstrap';
import { getVentasPorFecha, getGastos, crearGasto, getCierreDiario } from '../api';

export default function CierreCaja() {
  const [fecha, setFecha] = useState(new Date().toISOString().slice(0,10));
  const [ventas, setVentas] = useState([]);
  const [gastos, setGastos] = useState([]);
  const [resumen, setResumen] = useState(null);
  const [nuevoGasto, setNuevoGasto] = useState({ concepto: '', monto: '', categoria: '' });

  useEffect(() => {
    const cargar = async () => {
      const v = await getVentasPorFecha(fecha);
      const g = await getGastos(fecha);
      const r = await getCierreDiario(fecha);
      setVentas(v.data);
      setGastos(g.data);
      setResumen(r.data);
    };
    cargar();
  }, [fecha]);

  const handleAddGasto = async () => {
    await crearGasto({ ...nuevoGasto, fecha });
    setNuevoGasto({ concepto: '', monto: '', categoria: '' });
    const g = await getGastos(fecha);
    const r = await getCierreDiario(fecha);
    setGastos(g.data);
    setResumen(r.data);
  };

  return (
    <Container fluid className="p-4">
      <h1 className="mb-4">Cierre de Caja</h1>
      <Form.Group className="mb-3">
        <Form.Label>Fecha</Form.Label>
        <Form.Control type="date" value={fecha} onChange={e => setFecha(e.target.value)} />
      </Form.Group>

      {resumen && (
        <Row className="mb-4">
          <Col md={4}><Card><Card.Body><h5>Total Ventas</h5><p className="h3">${resumen.total_ventas.toLocaleString()}</p></Card.Body></Card></Col>
          <Col md={4}><Card><Card.Body><h5>Total Gastos</h5><p className="h3">${resumen.total_gastos.toLocaleString()}</p></Card.Body></Card></Col>
          <Col md={4}><Card><Card.Body><h5>Ganancia Neta</h5><p className="h3">${resumen.ganancia_neta.toLocaleString()}</p></Card.Body></Card></Col>
        </Row>
      )}

      <Row>
        <Col md={6}>
          <h3>Ventas del día</h3>
          <Table striped bordered hover>
            <thead><tr><th>#Factura</th><th>Total</th><th>Método</th><th>Hora</th></tr></thead>
            <tbody>
              {ventas.map(v => (
                <tr key={v.id}>
                  <td>{v.numero_factura || v.id}</td>
                  <td>${v.total?.toLocaleString()}</td>
                  <td>{v.metodo_pago}</td>
                  <td>{new Date(v.fecha).toLocaleTimeString()}</td>
                </tr>
              ))}
              {ventas.length === 0 && <tr><td colSpan="4">Sin ventas</td></tr>}
            </tbody>
          </Table>
        </Col>
        <Col md={6}>
          <h3>Gastos del día</h3>
          <Table striped bordered hover>
            <thead><tr><th>Concepto</th><th>Monto</th><th>Categoría</th></tr></thead>
            <tbody>
              {gastos.map(g => (
                <tr key={g.id}>
                  <td>{g.concepto}</td>
                  <td>${g.monto?.toLocaleString()}</td>
                  <td>{g.categoria}</td>
                </tr>
              ))}
            </tbody>
          </Table>
          <Card>
            <Card.Body>
              <h5>Agregar gasto</h5>
              <Form.Control className="mb-2" placeholder="Concepto" value={nuevoGasto.concepto} onChange={e => setNuevoGasto({...nuevoGasto, concepto: e.target.value})} />
              <Form.Control className="mb-2" type="number" placeholder="Monto" value={nuevoGasto.monto} onChange={e => setNuevoGasto({...nuevoGasto, monto: e.target.value})} />
              <Form.Control className="mb-2" placeholder="Categoría" value={nuevoGasto.categoria} onChange={e => setNuevoGasto({...nuevoGasto, categoria: e.target.value})} />
              <Button onClick={handleAddGasto}>Registrar Gasto</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      <Button variant="secondary" className="mt-3" onClick={() => window.print()}>Imprimir cierre</Button>
    </Container>
  );
}
