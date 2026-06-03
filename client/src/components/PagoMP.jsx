import QRCode from 'qrcode.react';

function ModalCierrePedido({ pedidoId, onClose }) {
  const [metodo, setMetodo] = useState('efectivo');
  const [paymentUrl, setPaymentUrl] = useState(null);

  const handleMetodoChange = (e) => {
    const nuevoMetodo = e.target.value;
    setMetodo(nuevoMetodo);
    if (nuevoMetodo === 'qr') {
      // Obtener link de pago dinámico
      fetch(`/api/pedidos/${pedidoId}/preferencia-mp`)
        .then(res => res.json())
        .then(data => {
          if (data.init_point) setPaymentUrl(data.init_point);
        });
    } else {
      setPaymentUrl(null);
    }
  };

  const confirmarCierre = async () => {
    // Si es QR y ya se pagó (por webhook o manual), cerrar pedido con método 'qr'
    // Aquí puedes llamar a POST /api/pedidos/:id/cerrar con metodo_pago: metodo
  };

  return (
    <div className="modal">
      <h3>Confirmar cierre de mesa</h3>
      <select value={metodo} onChange={handleMetodoChange}>
        <option value="efectivo">Efectivo</option>
        <option value="qr">Mercado Pago (QR)</option>
        <option value="debito">Débito</option>
        <option value="tarjeta">Tarjeta</option>
        <option value="transferencia">Transferencia</option>
      </select>

      {metodo === 'qr' && (
        <div>
          {paymentUrl ? (
            <>
              <QRCode value={paymentUrl} size={200} />
              <a href={paymentUrl} target="_blank">Abrir link de pago</a>
            </>
          ) : (
            <div>Cargando...</div>
          )}
          <button onClick={confirmarCierre}>Ya pagó (cerrar pedido)</button>
        </div>
      )}

      {metodo !== 'qr' && (
        <button onClick={confirmarCierre}>Cerrar pedido</button>
      )}
    </div>
  );
}