import jwt from 'jsonwebtoken'
import { findByEmail, verifyPassword } from '../services/userService.js'
import { pool } from '../db/pool.js'

const SECRET = process.env.ACCESS_TOKEN_KEY
const TOKEN_AGE = Number(process.env.ACCESS_TOKEN_AGE) || 43200;

if (!SECRET) {
  throw new Error('ACCESS_TOKEN_KEY env variable is required')
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email and password are required'
      })
    }

    const user = await findByEmail(email)
    if (!user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials'
      })
    }

    const ok = await verifyPassword(password, user.password)
    if (!ok) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid credentials'
      })
    }

    const payload = { developerId: user.id, email: user.email }
    const token = jwt.sign(payload, SECRET, { expiresIn: TOKEN_AGE })

    return res.json({
      status: 'success',
      data: {
        access_token: token,
        token_type: 'bearer',
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  } catch (err) {
    console.error('[login] Error:', err.message)
    next(err)
  }
}

export async function me(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized'
      })
    }

    // Fetch complete user data from database
    const { rows } = await pool.query(
      `
      select id, email, name
      from developers
      where id = $1
      `,
      [req.user.id]
    )

    if (rows.length === 0) {
      return res.status(404).json({
        status: 'fail',
        message: 'User not found'
      })
    }

    const user = rows[0]

    return res.json({
      status: 'success',
      data: {
        user: {
          id: user.id,
          email: user.email,
          name: user.name
        }
      }
    })
  } catch (err) {
    console.error('[me] Error:', err.message)
    next(err)
  }
}

// Optional: Refresh token endpoint
export async function refreshToken(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: 'fail',
        message: 'Unauthorized'
      })
    }

    const payload = { developerId: req.user.id, email: req.user.email }
    const token = jwt.sign(payload, SECRET, { expiresIn: TOKEN_AGE })

    return res.json({
      status: 'success',
      data: {
        access_token: token,
        token_type: 'bearer'
      }
    })
  } catch (err) {
    console.error('[refreshToken] Error:', err.message)
    next(err)
  }
}
