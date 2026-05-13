import { useParams } from 'react-router-dom';
import { Container, Card, Button, Alert, Spinner } from 'react-bootstrap';
import { useState, useEffect, useCallback } from 'react';

const API = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function MesaCliente() {
  const { numero } = useParams();
  const mesaNumero = Number(numero);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState(null);
  const [pedidoId, setPedidoId] = useState(null);
  const [mesaId, setMesaId] = useState(null);

  const resolverMesaYPedido = useCallback(async () => {
    setError(null);
    if (!Number.isFinite(mesaNumero) || mesaNumero < 1) {
      setError('Número de mesa inválido');
      return;
    }

    const mesasRes = await fetch(`${API}/api/mesas`);
    if (!mesasRes.ok) {
      setError('No se pudieron cargar las mesas');
      return;
    }

    const mesas = await mesasRes.json();
    const mesa = mesas.find((m) => m.numero === mesaNumero);
    if (!mesa) {
      setError(`No existe la mesa ${mesaNumero} en el sistema`);
      setMesaId(null);
      setPedidoId(null);
      return;
    }

    setMesaId(mesa.id);

    const pedidoRes = await fetch(`${API}/api/pedidos/mesa/${mesa.id}`);
    const pedido = await pedidoRes.json();
    setPedidoId(pedido?.id ?? null);
  }, [mesaNumero]);

  useEffect(() => {
    resolverMesaYPedido();
  }, [resolverMesaYPedido]);

  const cerrarPedido = async () => {
    try {
      setLoading(true);
      setError(null);
      setMensaje(null);

      if (!pedidoId) {
        throw new Error('No hay un pedido abierto para esta mesa');
      }

      const response = await fetch(`${API}/api/pedidos/${pedidoId}/cerrar`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ metodo_pago: 'efectivo' }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error al cerrar pedido');
      }

      if (data.ticket) {
        window.open(`${API}${data.ticket}`, '_blank');
      }

      setMensaje('Pedido cerrado y factura generada correctamente');
      await resolverMesaYPedido();
    } catch (err) {
      console.error('ERROR:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-4">
      <Card>
        <Card.Body>
          <h1>Menú — Mesa {mesaNumero}</h1>

          <p className="text-muted">
            Desde aquí podés cerrar el pedido activo de esta mesa y generar el comprobante.
          </p>

          {mesaId != null && (
            <p>
              <small>
                Pedido activo:{' '}
                {pedidoId ? (
                  <strong>#{pedidoId}</strong>
                ) : (
                  <span className="text-warning">ninguno (cobrá desde el panel o abrí la mesa en el dashboard)</span>
                )}
              </small>
            </p>
          )}

          {error && <Alert variant="danger">{error}</Alert>}
          {mensaje && <Alert variant="success">{mensaje}</Alert>}

          <div className="d-flex gap-2 mt-3">
            <Button
              variant="success"
              onClick={cerrarPedido}
              disabled={loading || !pedidoId}
            >
              {loading ? (
                <>
                  <Spinner size="sm" /> Procesando...
                </>
              ) : (
                'Cerrar y facturar'
              )}
            </Button>
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
}
