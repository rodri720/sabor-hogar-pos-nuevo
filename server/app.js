import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
  max: 1,
});

// ... aquí todas tus rutas con app.get, app.post, etc.
app.get('/api/health', (req, res) => res.json({ status: 'OK' }));

export default app;      // <-- importante
export { pool };         // si lo necesitas afuera