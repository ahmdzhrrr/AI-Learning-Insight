import * as insights from '../services/insightsService.js'
import * as students from '../services/studentService.js'

export async function getMyInsights(req, res, next) {
  try {
    const student = await students.getByUserId(req.user.id)
    if (!student) return res.status(404).json({ status: 'fail', message: 'siswa tidak ditemukan' })

    const latest = await insights.getLatest(student.id, process.env.INSIGHTS_MODE || 'mock')
    return res.json({ status: 'success', data: { insight: latest } })
  } catch (err) { next(err) }
}