import { Router } from 'express'
import { login, me } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const r = Router()

r.post('/login', login)
r.get('/me', requireAuth, me)

export default r