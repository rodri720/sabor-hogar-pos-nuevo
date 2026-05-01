import { useParams } from 'react-router-dom';
import { Container, Card } from 'react-bootstrap';

export default function MesaCliente() {
  const { id } = useParams();
  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h1>Menú - Mesa {id}</h1>
          <p>Pronto podrás hacer tu pedido desde aquí.<br />Por ahora, solicita a tu mozo.</p>
        </Card.Body>
      </Card>
    </Container>
  );
}
