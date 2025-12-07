import pkg from 'pg'
const { Pool } = pkg

const isLocal = process.env.NODE_ENV !== 'production'

export const pool = new Pool({
  connectionString: process.env.SUPABASE_DB_URL,
  ssl: isLocal
    ? false
    : { rejectUnauthorized: false },

  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 20000,
  keepAlive: true 
})

pool.on('error', (err) => {
  console.error('Unexpected Postgres error:', err)
})