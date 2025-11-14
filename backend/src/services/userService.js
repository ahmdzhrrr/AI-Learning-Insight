import bcrypt from 'bcrypt'
import { pool } from '../db/pool.js'

export async function findByEmail(email) {
  const { rows } = await pool.query(
    `
    select
      id,
      email,
      name,
      password
    from users
    where email = $1
    `,
    [email]
  )
  return rows[0] || null
}

export async function verifyPassword(plainPassword, hashedPassword) {
  if (
    typeof plainPassword !== 'string' ||
    typeof hashedPassword !== 'string' ||
    !hashedPassword.trim()
  ) {
    return false
  }

  return bcrypt.compare(plainPassword, hashedPassword)
}