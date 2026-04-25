import express from 'express';
import serverless from 'serverless-http';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Conexión a la base de datos de Supabase
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,  // <-- solo esto
  max: 1,
  idleTimeoutMillis: 30000,
});

// Endpoint de prueba
app.get('/api/health', async (req, res) => {
  res.json({ status: 'OK', message: 'Sabor Hogar API vía Netlify' });
});

// Ejemplo: obtener todos los productos
app.get('/api/productos', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productos WHERE activo = true ORDER BY nombre');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
});

// Aquí irán el resto de rutas: mesas, ventas, facturación ARCA, etc.

// Exportamos el handler envuelto
export const handler = serverless(app);