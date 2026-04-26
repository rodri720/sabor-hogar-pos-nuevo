import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import MesaCliente from './pages/MesaCliente';
import CierreCaja from './pages/CierreCaja';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/mesa/:id" element={<MesaCliente />} />
        <Route path="/cierre" element={<CierreCaja />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;