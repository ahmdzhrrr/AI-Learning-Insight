import { Router } from 'express'
import { getMyInsights } from '../controllers/insightsController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const r = Router()
r.get('/me', requireAuth, getMyInsights)

export default r