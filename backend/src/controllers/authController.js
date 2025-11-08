import * as users from '../services/userService.js'
import jwt from 'jsonwebtoken'

function signToken(payload) {
  return jwt.sign(payload, process.env.ACCESS_TOKEN_KEY, {
    expiresIn: Number(process.env.ACCESS_TOKEN_AGE || 900)
  })
}

export async function register(req, res, next) {
  try {
    const { email, password, name } = req.body
    if (!email || !password || !name) {
      return res.status(400).json({ status: 'fail', message: 'email, password, name wajib' })
    }
    const { user, student } = await users.createUser({ email, password, name })
    const token = signToken({ id: user.id, email: user.email })
    return res.status(201).json({
      status: 'success',
      data: { token, user: { id: user.id, email: user.email, name: user.name }, studentId: student.id }
    })
  } catch (err) {
    if (err.message === 'EMAIL_TAK_UNIK') {
      return res.status(400).json({ status: 'fail', message: 'email sudah digunakan' })
    }
    next(err)
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    if (!email || !password) {
      return res.status(400).json({ status: 'fail', message: 'email & password wajib' })
    }
    const user = await users.findByEmail(email)
    if (!user) return res.status(401).json({ status: 'fail', message: 'email / password salah' })
    const ok = await users.verifyPassword(user, password)
    if (!ok) return res.status(401).json({ status: 'fail', message: 'email / password salah' })

    const token = signToken({ id: user.id, email: user.email })
    return res.json({ status: 'success', data: { token } })
  } catch (err) { next(err) }
}

export async function me(req, res) {
  return res.json({ status: 'success', data: { user: req.user } })
}