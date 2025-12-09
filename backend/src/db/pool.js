import pkg from 'pg';
const { Pool } = pkg;

if (!process.env.SUPABASE_DB_URL) {
  throw new Error('SUPABASE_DB_URL is not set');
}

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  keepAlive: true,
});

pool.on('error', (err) => {
  console.error('Unexpected Postgres error:', err);
});