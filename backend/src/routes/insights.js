import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import {
  createOrUpdateInsight,
  getInsight,
  getInsightHistory,
  previewInsight
} from '../controllers/insightsController.js'

const router = Router()
router.use(requireAuth)

// Get latest insight for developer
router.get('/developers/:developerId/insights', getInsight)

// Generate/update insight (calls ML service)
router.post('/developers/:developerId/insights', createOrUpdateInsight)

// Get insight history
router.get('/developers/:developerId/insights/history', getInsightHistory)

// Preview insight without saving (uses fallback logic)
router.get('/developers/:developerId/insights/preview', previewInsight)

export default router
