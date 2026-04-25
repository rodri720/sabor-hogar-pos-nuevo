import { useEffect, useState } from 'react';
import axios from 'axios';

function App() {
  const [status, setStatus] = useState('');

  useEffect(() => {
    axios.get('http://localhost:4000/api/health')
      .then(res => setStatus(res.data.status))
      .catch(err => console.error(err));
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <h1 className="text-4xl font-bold text-amber-600">Sabor Hogar POS</h1>
      <p>Backend: {status}</p>
    </div>
  );
}

export default App;