import { Router } from 'express'
import { listMyMetrics, addMetric } from '../controllers/metricsController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const r = Router()
r.get('/me', requireAuth, listMyMetrics)
r.post('/', requireAuth, addMetric)

export default r