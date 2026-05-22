import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
  max: 10, // conexiones máximas en el pool
});

pool.on('connect', () => console.log('✅ Conectado a Neon (PostgreSQL)'));
pool.on('error', (err) => console.error('❌ Error en pool de PostgreSQL:', err));

export default pool;