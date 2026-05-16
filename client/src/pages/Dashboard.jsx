import { useEffect, useState, useMemo } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Badge,
  Spinner,
  ListGroup,
  ButtonGroup,
  Modal,
  Form,
  Alert,
} from "react-bootstrap";
import QRCode from "react-qr-code";
import { getMesas, getProductos, API_BASE } from "../api";
import "./Dashboard.css";

const METODOS_COBRO = [
  { id: "efectivo", label: "Efectivo", hint: "Caja física" },
  { id: "debito", label: "Débito", hint: "POS / débito" },
  { id: "tarjeta", label: "Tarjeta", hint: "Crédito o débito" },
  { id: "transferencia", label: "Transferencia", hint: "CBU / alias" },
  { id: "qr", label: "QR / Mercado Pago", hint: "Link o app MP" },
];

export default function Dashboard() {
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);
  const [mesaActiva, setMesaActiva] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [pedidoId, setPedidoId] = useState(null);
  const [busy, setBusy] = useState(false);
  const [showCobroModal, setShowCobroModal] = useState(false);
  const [metodoCobro, setMetodoCobro] = useState("efectivo");
  const [mpPaymentUrl, setMpPaymentUrl] = useState(null);
  const [mpLoading, setMpLoading] = useState(false);

  // Estados para el mozo
  const [mozos, setMozos] = useState([]);
  const [showMozoModal, setShowMozoModal] = useState(false);
  const [selectedMozoId, setSelectedMozoId] = useState("");
  const [pendingMesa, setPendingMesa] = useState(null);
  const [loadingMozos, setLoadingMozos] = useState(false);

  // Estados para titulares
  const [titulares, setTitulares] = useState([]);
  const [titularActivo, setTitularActivo] = useState(null);

  useEffect(() => {
    cargarMesas();
    getProductos()
      .then((r) => setProductos(r.data))
      .catch((e) => console.error("Productos:", e));
    cargarMozos();
    cargarTitulares();
  }, []);

  const cargarMozos = async () => {
    setLoadingMozos(true);
    try {
      const res = await fetch(`${API_BASE}/api/mozos`);
      if (!res.ok) throw new Error("Error al cargar mozos");
      const data = await res.json();
      setMozos(data);
    } catch (error) {
      console.error("Error cargando mozos:", error);
      setMozos([]);
    } finally {
      setLoadingMozos(false);
    }
  };

  const cargarTitulares = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/titulares`);
      if (!res.ok) throw new Error("Error al cargar titulares");
      const data = await res.json();
      setTitulares(data);
      if (data.length) setTitularActivo(data[0]); // por defecto el primero
    } catch (error) {
      console.error("Error cargando titulares:", error);
      setTitulares([]);
    }
  };

  const cargarMesas = async () => {
    try {
      const res = await getMesas();
      setMesas(res.data);
    } catch (e) {
      console.error("Mesas:", e);
      setMesas([]);
    }
  };

  const cargarPedido = async (mesa) => {
    if (!mesa?.id) {
      setPedido(null);
      setPedidoId(null);
      return null;
    }
    const res = await fetch(`${API_BASE}/api/pedidos/mesa/${mesa.id}`);
    const data = await res.json();

    if (!res.ok) {
      setPedido(null);
      setPedidoId(null);
      return null;
    }

    if (data && data.id) {
      setPedidoId(data.id);
      setPedido(data);
      return data.id;
    }
    setPedido(null);
    setPedidoId(null);
    return null;
  };

  const crearPedidoConMozo = async (mozoId) => {
    if (!pendingMesa) return;
    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          mesa_id: pendingMesa.id, 
          mozo: mozoId
        }),
      });
      const nuevo = await res.json();
      if (!res.ok) {
        alert(nuevo.error || nuevo.message || `Error ${res.status}`);
        setPendingMesa(null);
        setMesaActiva(null);
        await cargarMesas();
        return;
      }
      await cargarPedido(pendingMesa);
      await cargarMesas();
      setShowMozoModal(false);
      setSelectedMozoId("");
      setPendingMesa(null);
    } finally {
      setBusy(false);
    }
  };

  const seleccionarMesa = async (m) => {
    setBusy(true);
    try {
      setMesaActiva(m);
      let id = await cargarPedido(m);

      if (!id) {
        // No hay pedido abierto → pedir mozo
        setPendingMesa(m);
        setSelectedMozoId("");
        setShowMozoModal(true);
        return;
      }
      // Ya tiene pedido, solo refrescamos mesas
      await cargarMesas();
    } finally {
      setBusy(false);
    }
  };

  const refrescarPedido = async () => {
    if (!mesaActiva) return;
    setBusy(true);
    try {
      await cargarPedido(mesaActiva);
      await cargarMesas();
    } finally {
      setBusy(false);
    }
  };

  const liberarMesaActual = async () => {
    if (!mesaActiva?.id) return;
    if (
      !window.confirm(
        "¿Liberar esta mesa? Se borra el pedido abierto sin cobrar."
      )
    ) {
      return;
    }
    setBusy(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/mesas/${mesaActiva.id}/liberar`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        alert(data.error || "No se pudo liberar la mesa");
        return;
      }
      setPedido(null);
      setPedidoId(null);
      await cargarMesas();
      await cargarPedido(mesaActiva);
    } finally {
      setBusy(false);
    }
  };

  const soltarSeleccion = () => {
    setMesaActiva(null);
    setPedido(null);
    setPedidoId(null);
    cargarMesas();
  };

  const agregarProducto = async (p) => {
    if (!pedidoId || !mesaActiva) return;

    const res = await fetch(
      `${API_BASE}/api/pedidos/${pedidoId}/agregarProducto`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ producto_id: p.id, cantidad: 1 }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      alert(data.error || `No se pudo agregar el producto (${res.status})`);
      await cargarPedido(mesaActiva);
      return;
    }

    await cargarPedido(mesaActiva);
    await cargarMesas();
  };

  const abrirModalCobro = () => {
    setMetodoCobro("efectivo");
    setMpPaymentUrl(null);
    setShowCobroModal(true);
  };

  const generarLinkMercadoPago = async () => {
    if (!pedidoId) return;
    setMpLoading(true);
    try {
      const res = await fetch(
        `${API_BASE}/api/pedidos/${pedidoId}/preferencia-mp`,
        { method: "POST" }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        const fijo = import.meta.env.VITE_LINK_PAGO_FIJO;
        if (fijo) {
          setMpPaymentUrl(fijo);
          return;
        }
        alert(data.error || "No se pudo generar el link de pago");
        return;
      }
      setMpPaymentUrl(data.payment_url || data.init_point || null);
    } finally {
      setMpLoading(false);
    }
  };

  const confirmarCobro = async () => {
    if (!pedidoId) {
      alert("No hay pedido activo");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`${API_BASE}/api/pedidos/${pedidoId}/cerrar`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          metodo_pago: metodoCobro,
          titular_id: titularActivo?.id
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "No se pudo cobrar");
        return;
      }

      if (data.ticket) {
        window.open(`${API_BASE}${data.ticket}`);
      }

      setShowCobroModal(false);
      setMpPaymentUrl(null);
      setMesaActiva(null);
      setPedido(null);
      setPedidoId(null);
      await cargarMesas();
    } finally {
      setBusy(false);
    }
  };

  const cerrarModalCobro = () => {
    setShowCobroModal(false);
    setMpPaymentUrl(null);
  };

  const totalPedido = useMemo(() => {
    if (!pedido?.detalles?.length) return 0;
    return pedido.detalles.reduce((acc, d) => acc + Number(d.subtotal), 0);
  }, [pedido]);

  const productosPorCategoria = useMemo(() => {
    const map = {};
    for (const p of productos) {
      const c = p.categoria?.trim() || "Otros";
      if (!map[c]) map[c] = [];
      map[c].push(p);
    }
    const orden = Object.keys(map).sort((a, b) => a.localeCompare(b, "es"));
    return orden.map((c) => [c, map[c]]);
  }, [productos]);

  const nombreMozoActual = useMemo(() => {
    if (!pedido?.mozo_id) return null;
    const mozo = mozos.find((m) => m.id === pedido.mozo_id);
    return mozo ? mozo.nombre : `Mozo ID: ${pedido.mozo_id}`;
  }, [pedido, mozos]);

  const sinMesa = !mesaActiva;

  return (
    <div className="dashboard-pos py-3">
      <Container fluid className="px-lg-4">
        <Row className="align-items-center mb-3 g-2">
          <Col xs={12} md>
            <h4 className="mb-0 text-warning">Sala — punto de venta</h4>
            <small className="text-secondary">
              Elegí mesa → se abre o retoma el pedido. Podés liberar sin cobrar
              o cobrar e imprimir ticket.
            </small>
          </Col>
          
          {/* Selector de titular activo */}
          <Col xs="auto">
            <Form.Select 
              size="sm" 
              value={titularActivo?.id || ''}
              onChange={(e) => {
                const selected = titulares.find(t => t.id === Number(e.target.value));
                setTitularActivo(selected);
              }}
              style={{ width: '220px' }}
              className="bg-dark text-light border-secondary"
            >
              {titulares.map(t => (
                <option key={t.id} value={t.id}>{t.nombre}</option>
              ))}
            </Form.Select>
          </Col>

          <Col xs="auto">
            <ButtonGroup size="sm">
              <Button
                variant="outline-light"
                onClick={() => cargarMesas()}
                disabled={busy}
              >
                Actualizar mesas
              </Button>
              <Button
                variant="outline-warning"
                onClick={refrescarPedido}
                disabled={busy || sinMesa}
              >
                Refrescar pedido
              </Button>
            </ButtonGroup>
          </Col>
        </Row>

        <Row className="g-3">
          {/* Mesas */}
          <Col lg={3} md={4}>
            <Card className="panel-dark text-light h-100">
              <Card.Header className="d-flex justify-content-between align-items-center border-secondary bg-transparent">
                <span className="fw-semibold">Mesas</span>
                {busy && <Spinner size="sm" animation="border" />}
              </Card.Header>
              <Card.Body className="scroll-panel pt-2">
                {mesas.length === 0 && (
                  <p className="text-secondary small mb-0">
                    No hay mesas. Ejecutá el seed en el servidor.
                  </p>
                )}
                {mesas.map((m) => {
                  const ocupada = m.estado === "ocupada";
                  const active = mesaActiva?.id === m.id;
                  return (
                    <Card
                      key={m.id}
                      className={`mb-2 mesa-card bg-dark text-light border-secondary ${ocupada ? "ocupada" : "libre"} ${active ? "active" : ""}`}
                      onClick={() => seleccionarMesa(m)}
                    >
                      <Card.Body className="py-2 px-3">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>Mesa {m.numero}</strong>
                          <Badge bg={ocupada ? "danger" : "success"}>
                            {ocupada ? "Ocupada" : "Libre"}
                          </Badge>
                        </div>
                        <small className="text-secondary">
                          Tocá para cargar o crear pedido
                        </small>
                      </Card.Body>
                    </Card>
                  );
                })}
              </Card.Body>
            </Card>
          </Col>

          {/* Pedido */}
          <Col lg={5} md={8}>
            <Card className="panel-dark text-light h-100">
              <Card.Header className="border-secondary bg-transparent">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <span className="fw-semibold">
                    {mesaActiva
                      ? `Pedido — Mesa ${mesaActiva.numero}`
                      : "Pedido"}
                  </span>
                  {pedidoId && (
                    <Badge bg="secondary">#{pedidoId}</Badge>
                  )}
                </div>
                {nombreMozoActual && (
                  <div className="mt-1 small text-info">
                    Mozo: {nombreMozoActual}
                  </div>
                )}
              </Card.Header>
              <Card.Body>
                {sinMesa && (
                  <p className="text-secondary mb-0">
                    Seleccioná una mesa a la izquierda para empezar o seguir
                    cargando consumiciones.
                  </p>
                )}

                {!sinMesa && !pedidoId && (
                  <p className="text-secondary mb-0">
                    No hay pedido abierto. Volvé a tocar la mesa o usá
                    &quot;Refrescar pedido&quot;.
                  </p>
                )}

                {pedido?.detalles?.length === 0 && (
                  <p className="text-warning mb-2">Pedido vacío — agregá ítems.</p>
                )}

                {pedido?.detalles?.length > 0 && (
                  <ListGroup variant="flush" className="mb-3 rounded overflow-hidden">
                    {pedido.detalles.map((d) => (
                      <ListGroup.Item
                        key={d.id}
                        className="bg-dark text-light border-secondary d-flex justify-content-between"
                      >
                        <span>
                          {d.nombre}{" "}
                          <Badge bg="secondary" pill className="ms-1">
                            ×{d.cantidad}
                          </Badge>
                        </span>
                        <span className="text-warning">${Number(d.subtotal).toFixed(2)}</span>
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}

                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
                  <h5 className="mb-0 text-white">
                    Total:{" "}
                    <span className="text-warning">${totalPedido.toFixed(2)}</span>
                  </h5>
                </div>

                <div className="d-flex flex-wrap gap-2">
                  <Button
                    variant="success"
                    size="lg"
                    onClick={abrirModalCobro}
                    disabled={busy || !pedidoId || !pedido?.detalles?.length}
                  >
                    {busy ? <Spinner size="sm" animation="border" /> : null}{" "}
                    Cobrar…
                  </Button>
                  <Button
                    variant="outline-danger"
                    onClick={liberarMesaActual}
                    disabled={busy || sinMesa || !pedidoId}
                  >
                    Liberar mesa
                  </Button>
                  <Button
                    variant="outline-secondary"
                    onClick={soltarSeleccion}
                    disabled={busy || sinMesa}
                  >
                    Otra mesa (soltar)
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Productos */}
          <Col lg={4}>
            <Card className="panel-dark text-light h-100">
              <Card.Header className="border-secondary bg-transparent fw-semibold">
                Menú — tocar para sumar al pedido
              </Card.Header>
              <Card.Body className="scroll-panel pt-2">
                {!pedidoId && !sinMesa && (
                  <p className="small text-warning">
                    Esperando pedido… tocá la mesa de nuevo o refrescá.
                  </p>
                )}
                {sinMesa && (
                  <p className="small text-secondary">
                    Elegí una mesa para habilitar los productos.
                  </p>
                )}

                {productosPorCategoria.map(([cat, items]) => (
                  <div key={cat}>
                    <div className="categoria-titulo">{cat}</div>
                    <div className="d-grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))" }}>
                      {items.map((p) => (
                        <button
                          key={p.id}
                          type="button"
                          className="producto-btn rounded-3 px-2 py-2"
                          onClick={() => agregarProducto(p)}
                          disabled={!pedidoId || busy}
                        >
                          <strong>{p.nombre}</strong>
                          <div className="small opacity-90 mt-1">
                            ${Number(p.precio).toFixed(0)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}

                {productos.length === 0 && (
                  <p className="text-secondary small">
                    Sin productos en la base. Corré{" "}
                    <code className="text-light">npm run seed</code> en el servidor.
                  </p>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>

        {/* MODAL PARA SELECCIONAR MOZO */}
        <Modal
          show={showMozoModal}
          onHide={() => {
            setShowMozoModal(false);
            setPendingMesa(null);
            setSelectedMozoId("");
          }}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton className="bg-dark text-light border-secondary">
            <Modal.Title>Asignar mozo a la mesa</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            {loadingMozos ? (
              <div className="text-center">
                <Spinner animation="border" variant="light" />
                <p className="mt-2">Cargando mozos...</p>
              </div>
            ) : mozos.length === 0 ? (
              <Alert variant="danger">
                No hay mozos registrados. No se puede abrir la mesa sin asignar un mozo.
              </Alert>
            ) : (
              <>
                <p className="mb-3">
                  Seleccioná el mozo que atenderá la <strong>Mesa {pendingMesa?.numero}</strong>:
                </p>
                <Form.Group>
                  {mozos.map((mozo) => (
                    <Form.Check
                      key={mozo.id}
                      type="radio"
                      id={`mozo-${mozo.id}`}
                      name="mozoSeleccionado"
                      label={mozo.nombre}
                      value={mozo.id}
                      checked={selectedMozoId === String(mozo.id)}
                      onChange={(e) => setSelectedMozoId(e.target.value)}
                      className="mb-2"
                    />
                  ))}
                </Form.Group>
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button
              variant="secondary"
              onClick={() => {
                setShowMozoModal(false);
                setPendingMesa(null);
                setSelectedMozoId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={() => crearPedidoConMozo(selectedMozoId)}
              disabled={!selectedMozoId || mozos.length === 0 || loadingMozos}
            >
              Abrir mesa con este mozo
            </Button>
          </Modal.Footer>
        </Modal>

        {/* MODAL DE COBRO (existente) */}
        <Modal
          show={showCobroModal}
          onHide={cerrarModalCobro}
          centered
          backdrop="static"
        >
          <Modal.Header
            closeButton
            className="bg-dark text-light border-secondary"
          >
            <Modal.Title>Cobrar pedido</Modal.Title>
          </Modal.Header>
          <Modal.Body className="bg-dark text-light">
            <p className="mb-3">
              Total:{" "}
              <strong className="text-warning fs-5">
                ${totalPedido.toFixed(2)}
              </strong>
            </p>
            <Form.Label className="text-secondary small text-uppercase">
              Forma de pago
            </Form.Label>
            <div className="mb-3">
              {METODOS_COBRO.map((m) => (
                <Form.Check
                  key={m.id}
                  type="radio"
                  id={`cobro-${m.id}`}
                  name="metodoCobro"
                  label={
                    <span>
                      <strong>{m.label}</strong>{" "}
                      <span className="text-secondary">— {m.hint}</span>
                    </span>
                  }
                  value={m.id}
                  checked={metodoCobro === m.id}
                  onChange={(e) => {
                    setMetodoCobro(e.target.value);
                    if (e.target.value !== "qr") setMpPaymentUrl(null);
                  }}
                  className="mb-2"
                />
              ))}
            </div>

            {metodoCobro === "qr" && (
              <>
                <Alert variant="secondary" className="py-2 small text-dark">
                  Generá el link de Mercado Pago y mostrá el QR al cliente. Cuando
                  pague, tocá &quot;Confirmar cobro e imprimir&quot;. Para el
                  link automático agregá{" "}
                  <code className="user-select-all">MERCADOPAGO_ACCESS_TOKEN</code>{" "}
                  en <code>server/.env</code>. Sin token podés usar{" "}
                  <code>VITE_LINK_PAGO_FIJO</code> en el cliente (link de pago
                  MP) y se usará como QR.
                </Alert>
                <div className="d-flex flex-wrap gap-2 align-items-center mb-3">
                  <Button
                    variant="outline-light"
                    size="sm"
                    onClick={generarLinkMercadoPago}
                    disabled={mpLoading || !pedidoId}
                  >
                    {mpLoading ? (
                      <Spinner size="sm" animation="border" />
                    ) : null}{" "}
                    Generar link / QR
                  </Button>
                  {mpPaymentUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      href={mpPaymentUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-info p-0"
                    >
                      Abrir en el navegador
                    </Button>
                  )}
                </div>
                {mpPaymentUrl && (
                  <div className="d-flex flex-column align-items-center p-3 bg-white rounded">
                    <QRCode value={mpPaymentUrl} size={200} />
                    <small
                      className="text-dark mt-2 text-break"
                      style={{ maxWidth: 300 }}
                    >
                      {mpPaymentUrl}
                    </small>
                  </div>
                )}
              </>
            )}
          </Modal.Body>
          <Modal.Footer className="bg-dark border-secondary">
            <Button variant="secondary" onClick={cerrarModalCobro} disabled={busy}>
              Cancelar
            </Button>
            <Button variant="success" onClick={confirmarCobro} disabled={busy}>
              {busy ? <Spinner size="sm" animation="border" /> : null} Confirmar
              cobro e imprimir
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </div>
  );
}