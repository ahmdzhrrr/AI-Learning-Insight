import * as metrics from '../services/metricsService.js'

export async function getMetrics(req, res, next) {
  try {
    const studentId = parseInt(req.params.userId, 10)
    const data = await metrics.getByUserId(studentId)
    if (!data)
      return res.status(404).json({ status: 'fail', message: 'metrics not found' })

    res.json({ status: 'success', data: { metrics: data } })
  } catch (e) { next(e) }
}

export async function upsertMetrics(req, res, next) {
  try {
    const studentId = parseInt(req.params.userId, 10)
    const data = await metrics.upsertDirect({
      studentId,
      features: req.body
    })
    res.json({ status: 'success', data: { metrics: data } })
  } catch (e) { next(e) }
}