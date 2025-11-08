export function notFoundHandler(_req, res) {
    res.status(404).json({ status: 'fail', message: 'Route tidak ditemukan' })
  }
  
  export function errorHandler(err, _req, res, _next) {
    console.error(err)
    res.status(500).json({ status: 'error', message: 'Internal Server Error' })
  }  