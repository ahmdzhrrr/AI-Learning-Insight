import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { 
  getMetrics, 
  upsertMetrics, 
  getMetricsOverview, 
  getWeeklyProgressHandler, 
  getHistoricalPerformanceHandler,
  getStudyTimeHandler,
  initializeMetricsHandler
} from '../controllers/metricsController.js'

const router = Router()
router.use(requireAuth)

// Main metrics endpoints
router.get('/developers/:developerId/metrics', getMetrics)
router.put('/developers/:developerId/metrics', upsertMetrics)
router.post('/developers/:developerId/metrics/init', initializeMetricsHandler)

// Dashboard data endpoints
router.get('/developers/:developerId/metrics/overview', getMetricsOverview)
router.get('/developers/:developerId/metrics/weekly', getWeeklyProgressHandler)
router.get('/developers/:developerId/metrics/history', getHistoricalPerformanceHandler)
router.get('/developers/:developerId/metrics/study-time', getStudyTimeHandler)

export default router
