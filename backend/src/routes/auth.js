import { Router } from 'express'
import { register, login, me } from '../controllers/authController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const r = Router()
r.post('/register', register)
r.post('/login', login)
r.get('/me', requireAuth, me)

export default r