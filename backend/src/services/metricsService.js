import { pool } from '../db/pool.js'

export async function listByStudent(studentId, limit = 30) {
  const { rows } = await pool.query(
    `select id, date, study_hours, attendance, assignment_completion,
            motivation, stress_level, discussions, resources
     from metrics
     where student_id=$1
     order by date desc
     limit $2`,
    [studentId, limit]
  )
  return rows
}

export async function create(studentId, p) {
  const q = `insert into metrics
    (student_id, date, study_hours, attendance, assignment_completion,
     motivation, stress_level, discussions, resources)
    values ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    returning id`
  const vals = [
    studentId, p.date, p.study_hours ?? null, p.attendance ?? null,
    p.assignment_completion ?? null, p.motivation ?? null, p.stress_level ?? null,
    p.discussions ?? null, p.resources ?? null
  ]
  const { rows } = await pool.query(q, vals)
  return rows[0].id
}