import { Router } from 'express'
import { requireAuth } from '../middlewares/authMiddleware.js'
import { getMetrics, upsertMetrics} from '../controllers/metricsController.js'

const router = Router()
router.use(requireAuth)

router.get('/users/:userId/metrics', getMetrics)
router.put('/users/:userId/metrics', upsertMetrics)

export default router