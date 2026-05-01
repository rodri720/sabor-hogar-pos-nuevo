import { Tabs, Tab } from 'react-bootstrap';
import AdminMesas from './admin/AdminMesas';
import AdminMozos from './admin/AdminMozos';
import AdminProductos from './admin/AdminProductos';
import AdminCombos from './admin/AdminCombos';

export default function AdminPage() {
  return (
    <div className="p-4">
      <h1 className="mb-4">Administración</h1>
      <Tabs defaultActiveKey="mesas">
        <Tab eventKey="mesas" title="Mesas"><AdminMesas /></Tab>
        <Tab eventKey="mozos" title="Mozos"><AdminMozos /></Tab>
        <Tab eventKey="productos" title="Productos"><AdminProductos /></Tab>
        <Tab eventKey="combos" title="Combos"><AdminCombos /></Tab>
      </Tabs>
    </div>
  );
}
