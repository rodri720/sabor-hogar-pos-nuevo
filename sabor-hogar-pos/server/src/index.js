import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';

dotenv.config(); // Carga variables de entorno

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas de ejemplo
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Sabor Hogar POS API' });
});

// Importar rutas (las crearemos después)
// app.use('/api/productos', productosRoutes);
// app.use('/api/mesas', mesasRoutes);
// app.use('/api/ventas', ventasRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
});