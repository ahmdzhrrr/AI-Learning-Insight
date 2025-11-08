import { Router } from 'express'
import { getMyProfile } from '../controllers/studentController.js'
import { requireAuth } from '../middlewares/authMiddleware.js'

const r = Router()
r.get('/me', requireAuth, getMyProfile)

export default r