import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import './src/db/createTables.js';
import mozosRoutes from './src/routes/mozos.js';
import combosRoutes from './src/routes/combos.js';
import gastosRoutes from './src/routes/gastos.js';
import cierreRoutes from './src/routes/cierre.js';
// Rutas
import productosRoutes from './src/routes/productos.js';
import mesasRoutes from './src/routes/mesas.js';
import pedidosRoutes from './src/routes/pedidos.js';
import ventasRoutes from './src/routes/ventas.js';
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRoutes);
app.use('/api/mozos', mozosRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/cierre', cierreRoutes);
app.use('/api/ventas', ventasRoutes);
// Ruta de prueba
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Middleware de error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});