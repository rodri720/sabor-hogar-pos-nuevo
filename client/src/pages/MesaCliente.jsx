import { useParams } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useState } from 'react';

export default function MesaCliente() {
  const { id } = useParams();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);

  // ✅ verificar .env
  const baseURL = import.meta.env.VITE_API_URL;

  console.log("API URL:", baseURL);

  const cerrarPedido = async () => {
    try {
      console.log("CLICK cerrar pedido ✅");

      setLoading(true);
      setError(null);
      setMensaje(null);

      // ✅ fetch correcto
      const response = await fetch(`${baseURL}/api/pedidos/${id}/cerrar`, {
        method: 'POST'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cerrar pedido');
      }

      // ✅ abrir ticket automáticamente
      if (data.ticket) {
        window.open(`${baseURL}${data.ticket}`, '_blank');
      }

      setMensaje('✅ Pedido cerrado y facturado correctamente');

    } catch (err) {
      console.error("ERROR:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h1>Menú - Mesa {id}</h1>

          <p>
            Desde aquí podés cerrar el pedido y generar la factura.
          </p>

          {error && <Alert variant="danger">{error}</Alert>}
          {mensaje && <Alert variant="success">{mensaje}</Alert>}

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="success"
              onClick={cerrarPedido}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Procesando...
                </>
              ) : (
                'Cerrar y Facturar'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}