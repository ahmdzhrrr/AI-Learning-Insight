export function notFoundHandler(_req, res) {
  res.status(404).json({ status: 'fail', message: 'Route tidak ditemukan' })
}

export function errorHandler(err, _req, res, _next) {
  console.error(err)
  if (err.name === 'ValidationError') {
    return res.status(400).json({ status: 'fail', message: err.message })
  }
  if (err.code === '23505') {
    return res.status(400).json({ status: 'fail', message: 'email sudah digunakan' })
  }  
  if (err.message === 'ML_SERVICE_UNAVAILABLE') {
    return res.status(503).json({ status: 'error', message: 'Layanan ML tidak tersedia' })
  }
  res.status(500).json({ status: 'error', message: 'Internal Server Error' })
}