import express from 'express';
import cors from 'cors';
import path from 'path';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
import titularRoutes from './src/routes/titulares.js';

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 3000;

// ✅ Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// ✅ CREAR TABLAS
await crearTablas();

// ✅ SERVIR TICKETS (CORRECTO 🔥)
app.use('/tickets', express.static(path.join(__dirname, 'tickets')));

// ✅ RUTAS
app.use('/api/productos', productosRoutes);
app.use('/api/mesas', mesasRoutes);
app.use('/api/pedidos', pedidosRouter);
app.use('/api/mozos', mozosRoutes);
app.use('/api/combos', combosRoutes);
app.use('/api/gastos', gastosRoutes);
app.use('/api/cierre', cierreRoutes);
app.use('/api/ventas', ventasRoutes);
app.use('/api/titulares', titularRoutes);
// ✅ HEALTH
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date() });
});

// ✅ ERROR GLOBAL
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

// ✅ START SERVER
const server = app.listen(PORT);

server.once('listening', () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log('   Dejá esta terminal abierta. Ctrl+C para detener.');
});

server.on('error', (err) => {
  console.error('❌ No se pudo abrir el puerto:', err.message);
  if (err.code === 'EADDRINUSE') {
    console.error(
      `   El puerto ${PORT} ya está en uso (¿otro npm run dev?). Cerrá esa ventana o en server/.env definí PORT=3001`
    );
  }
  process.exit(1);
});

// En tu archivo principal (ej. server.js o routes/mozos.js)
