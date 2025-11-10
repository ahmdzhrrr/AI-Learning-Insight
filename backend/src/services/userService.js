import { pool } from '../db/pool.js'
import bcrypt from 'bcrypt'

export async function findByEmail(email) {
  const q = 'select * from users where email=$1 limit 1'
  const { rows } = await pool.query(q, [email])
  return rows[0] || null
}

export async function verifyPassword(user, password) {
  return bcrypt.compare(password, user.password_hash)
}

export async function createUser({ email, password, name }) {
  const existed = await findByEmail(email)
  if (existed) {
    const e = new Error('email sudah digunakan')
    e.code = '23505'
    throw e
  }

  const hash = await bcrypt.hash(password, 10)
  const u = await pool.query(
    `insert into users (email, password_hash, name) values ($1,$2,$3) returning id,email,name`,
    [email, hash, name]
  )
  const user = u.rows[0]

  const s = await pool.query(
    `insert into students (user_id, class) values ($1,$2) returning id,user_id,class,created_at`,
    [user.id, null]
  )
  return { user, student: s.rows[0] }
}