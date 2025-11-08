import { pool } from '../db/pool.js'

export async function getByUserId(userId) {
  const { rows } = await pool.query(
    `select s.id, s.user_id, s.class, u.name, u.email
     from students s join users u on u.id=s.user_id
     where s.user_id=$1 limit 1`, [userId]
  )
  return rows[0] || null
}