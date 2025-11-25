import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { getMetrics, upsertMetrics, getMetricsOverview, getWeeklyProgressHandler, getHistoricalPerformanceHandler } from '../controllers/metricsController.js'

const router = Router()
router.use(requireAuth)

router.get('/developers/:developerId/metrics', getMetrics)
router.put('/developers/:developerId/metrics', upsertMetrics)
router.get('/developers/:developerId/metrics/overview', getMetricsOverview)
router.get('/developers/:developerId/metrics/weekly', getWeeklyProgressHandler)
router.get('/developers/:developerId/metrics/history', getHistoricalPerformanceHandler)

export default router
