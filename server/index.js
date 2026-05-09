import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';

import { crearTablas } from './src/db/createTables.js';

// Rutas
import productosRoutes from './src/routes/productos.js';
import mesasRoutes from './src/routes/mesas.js';
import pedidosRouter from './src/routes/pedidos.js';
import mozosRoutes from './src/routes/mozos.js';
import combosRoutes from './src/routes/combos.js';
import gastosRoutes from './src/routes/gastos.js';
import cierreRoutes from './src/routes/cierre.js';
import ventasRoutes from './src/routes/ventas.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000; // importante

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ Crear tablas al iniciar
await crearTablas();

// Rutas
app.use('/api/productos', productosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/mozos', mozosRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/cierre', cierreRoutes);
app.use('/api/ventas', ventasRoutes);

// ✅ Servir tickets PDF
app.use('/tickets', express.static(path.resolve('storage/tickets')));

// Ruta test
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// Error global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// START SERVER
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});