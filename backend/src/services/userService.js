import bcrypt from 'bcrypt'
import { pool } from '../db/pool.js'

export async function findByEmail(email) {
  try {
    const { rows } = await pool.query(
      `
      select
        id,
        email,
        name,
        password
      from developers
      where email = $1
      `,
      [email]
    )
    return rows[0] || null
  } catch (error) {
    console.error('[findByEmail] Database error:', error.message)
    throw error
  }
}

export async function verifyPassword(plainPassword, hashedPassword) {
  if (!plainPassword || !hashedPassword) return false
  try {
    return await bcrypt.compare(plainPassword, hashedPassword)
  } catch (error) {
    console.error('[verifyPassword] Error:', error.message)
    return false
  }
}

export async function findById(id) {
  try {
    const { rows } = await pool.query(
      `
      select
        id,
        email,
        name
      from developers
      where id = $1
      `,
      [id]
    )
    return rows[0] || null
  } catch (error) {
    console.error('[findById] Database error:', error.message)
    throw error
  }
}

export async function updateUser(id, updates) {
  const { name, email } = updates
  
  try {
    const { rows } = await pool.query(
      `
      update developers
      set 
        name = coalesce($2, name),
        email = coalesce($3, email)
      where id = $1
      returning id, email, name
      `,
      [id, name, email]
    )
    return rows[0] || null
  } catch (error) {
    console.error('[updateUser] Database error:', error.message)
    throw error
  }
}
