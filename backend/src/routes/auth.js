import { Router } from 'express'
import { login, me, refreshToken } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const router = Router()

// Public routes
router.post('/login', login)

// Protected routes
router.get('/me', requireAuth, me)
router.post('/refresh', requireAuth, refreshToken)

export default router
