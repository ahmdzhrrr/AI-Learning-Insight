import jwt from 'jsonwebtoken'

const SECRET = process.env.ACCESS_TOKEN_KEY

if (!SECRET) {
  throw new Error('ACCESS_TOKEN_KEY env variable is required')
}

export function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      status: 'fail',
      message: 'Unauthorized: token tidak ditemukan'
    })
  }

  const token = authHeader.split(' ')[1]

  try {
    const payload = jwt.verify(token, SECRET)

    if (!payload.developerId) {
      return res.status(401).json({
        status: 'fail',
        message: 'Token tidak valid (developerId hilang)'
      })
    }

    req.user = {
      id: payload.developerId,
      developerId: payload.developerId,
      email: payload.email
    }

    next()
  } catch (err) {
    console.log('[Auth] JWT verify failed:', err.message)

    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Token kedaluwarsa. Silakan login kembali.'
      })
    }

    return res.status(401).json({
      status: 'fail',
      message: 'Token tidak valid.'
    })
  }
}
