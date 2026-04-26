import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getProductos, getCombos } from '../api';

export default function MesaCliente() {
  const { id } = useParams(); // número de mesa
  const [productos, setProductos] = useState([]);
  const [combos, setCombos] = useState([]);

  useEffect(() => {
    getProductos().then(res => setProductos(res.data));
    getCombos().then(res => setCombos(res.data));
  }, []);

  return (
    <div>
      <h1>Menú - Mesa {id}</h1>
      <h2>Productos</h2>
      {productos.map(p => <div key={p.id}>{p.nombre} - ${p.precio}</div>)}
      <h2>Combos</h2>
      {combos.map(c => <div key={c.id}>{c.nombre} - ${c.precio}</div>)}
      <p>Para pedir, solicite a su mozo.</p>
    </div>
  );
}