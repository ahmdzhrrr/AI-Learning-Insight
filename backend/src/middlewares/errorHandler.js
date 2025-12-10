export function notFoundHandler(_req, res) {
  res.status(404).json({ 
    status: 'fail', 
    message: 'Route tidak ditemukan' 
  })
}

export function errorHandler(err, _req, res, _next) {
  // Log error for debugging
  console.error('[ErrorHandler]', {
    name: err.name,
    message: err.message,
    status: err.status,
    code: err.code,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })

  // Handle specific error types
  
  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({ 
      status: 'fail', 
      message: err.message 
    })
  }

  // PostgreSQL unique constraint violation
  if (err.code === '23505') {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Email sudah digunakan' 
    })
  }

  // PostgreSQL foreign key violation
  if (err.code === '23503') {
    return res.status(400).json({ 
      status: 'fail', 
      message: 'Reference tidak valid' 
    })
  }

  // PostgreSQL connection errors
  if (err.code === 'ECONNREFUSED' || err.code === 'ENOTFOUND') {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Database service tidak tersedia' 
    })
  }

  // ML Service unavailable
  if (err.message === 'ML_SERVICE_UNAVAILABLE') {
    return res.status(503).json({ 
      status: 'error', 
      message: 'Layanan ML tidak tersedia' 
    })
  }

  // Axios errors (external API calls)
  if (err.name === 'AxiosError') {
    if (err.code === 'ECONNREFUSED') {
      return res.status(503).json({ 
        status: 'error', 
        message: 'External service tidak tersedia' 
      })
    }
    if (err.code === 'ETIMEDOUT' || err.code === 'ECONNABORTED') {
      return res.status(504).json({ 
        status: 'error', 
        message: 'Request timeout ke external service' 
      })
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Token tidak valid' 
    })
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({ 
      status: 'fail', 
      message: 'Token kedaluwarsa' 
    })
  }

  // Custom status errors
  if (err.status) {
    return res.status(err.status).json({ 
      status: err.status < 500 ? 'fail' : 'error', 
      message: err.message || 'Unknown error' 
    })
  }

  // Default internal server error
  res.status(500).json({ 
    status: 'error', 
    message: process.env.NODE_ENV === 'development' 
      ? err.message 
      : 'Internal Server Error' 
  })
}

// Async error wrapper
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
