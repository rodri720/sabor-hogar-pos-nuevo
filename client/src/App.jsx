import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { Navbar, Nav, Container } from "react-bootstrap";
import Dashboard from "./pages/Dashboard";
import MesaCliente from "./pages/MesaCliente";
import CierreCaja from "./pages/CierreCaja";
import GestionMenu from "./pages/GestionMenu";
import ControlStock from "./pages/ControlStock";
import Reportes from "./pages/Reportes";

function App() {
  return (
    <BrowserRouter>
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          <Navbar.Brand as={Link} to="/">Sabor Hogar POS</Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="me-auto">
              <Nav.Link as={Link} to="/">Dashboard</Nav.Link>
              <Nav.Link as={Link} to="/gestion-menu">Gestión Menú</Nav.Link>
              <Nav.Link as={Link} to="/control-stock">Control Stock</Nav.Link>
              <Nav.Link as={Link} to="/reportes">Reportes</Nav.Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
      <Container className="mt-3">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/mesa/:numero" element={<MesaCliente />} />
          <Route path="/cierre-caja" element={<CierreCaja />} />
          <Route path="/gestion-menu" element={<GestionMenu />} />
          <Route path="/control-stock" element={<ControlStock />} />
          <Route path="/reportes" element={<Reportes />} />
        </Routes>
      </Container>
    </BrowserRouter>
  );
}

export default App;