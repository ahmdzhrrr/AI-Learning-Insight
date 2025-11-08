import * as metrics from '../services/metricsService.js'
import * as students from '../services/studentService.js'

export async function listMyMetrics(req, res, next) {
  try {
    const student = await students.getByUserId(req.user.id)
    if (!student) return res.status(404).json({ status: 'fail', message: 'siswa tidak ditemukan' })
    const rows = await metrics.listByStudent(student.id, Number(req.query.limit) || 30)
    return res.json({ status: 'success', data: { metrics: rows } })
  } catch (err) { next(err) }
}

export async function addMetric(req, res, next) {
  try {
    const student = await students.getByUserId(req.user.id)
    if (!student) return res.status(404).json({ status: 'fail', message: 'siswa tidak ditemukan' })

    const payload = req.body ?? {}
    // minimal validation
    if (!payload.date) payload.date = new Date().toISOString().slice(0, 10)

    const id = await metrics.create(student.id, payload)
    return res.status(201).json({ status: 'success', data: { id } })
  } catch (err) { next(err) }
}