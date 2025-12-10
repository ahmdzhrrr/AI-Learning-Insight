import { 
  getMetricsByDeveloperId, 
  upsertDirect, 
  getOverviewMetrics, 
  getWeeklyProgress, 
  getHistoricalPerformance,
  getStudyTimeData,
  initializeMetrics
} from '../services/metricsService.js'

export async function getMetrics(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    let data = await getMetricsByDeveloperId(id)

    // If no metrics found, initialize with defaults
    if (!data) {
      console.log(`[getMetrics] No metrics for developer ${id}, initializing...`)
      data = await initializeMetrics(id)
      
      // If still no data (developer doesn't exist), return 404
      if (!data) {
        return res.status(404).json({
          status: 'fail',
          message: 'Metrics not found and could not be initialized'
        })
      }
    }

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[getMetrics] Error:', err.message)
    
    if (err.status === 400) {
      return res.status(400).json({
        status: 'fail',
        message: err.message
      })
    }
    
    next(err)
  }
}

export async function upsertMetrics(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const metrics = req.body

    const data = await upsertDirect({ developerId: id, metrics })

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[upsertMetrics] Error:', err.message)
    next(err)
  }
}

export async function getMetricsOverview(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    let data = await getOverviewMetrics(id)

    // Return default overview if no metrics
    if (!data) {
      data = {
        developerId: id,
        avgStudyTimeHours: 0,
        totalActiveDays: 0,
        totalJourneysCompleted: 0,
        totalSubmissions: 0,
        rejectedSubmissions: 0,
        avgExamScore: 0,
        rejectionRatio: 0,
        clusterLabel: null,
        estimatedWeeklyCompleted: 0
      }
    }

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[getMetricsOverview] Error:', err.message)
    next(err)
  }
}

export async function getWeeklyProgressHandler(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const data = await getWeeklyProgress(id)

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[getWeeklyProgressHandler] Error:', err.message)
    next(err)
  }
}

export async function getHistoricalPerformanceHandler(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const data = await getHistoricalPerformance(id)

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[getHistoricalPerformanceHandler] Error:', err.message)
    next(err)
  }
}

// New handler for study time data
export async function getStudyTimeHandler(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const data = await getStudyTimeData(id)

    return res.json({
      status: 'success',
      data
    })
  } catch (err) {
    console.error('[getStudyTimeHandler] Error:', err.message)
    next(err)
  }
}

// Initialize metrics for a developer
export async function initializeMetricsHandler(req, res, next) {
  try {
    const { developerId } = req.params
    const id = parseInt(developerId, 10)
    
    if (Number.isNaN(id)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const data = await initializeMetrics(id)

    return res.json({
      status: 'success',
      data,
      message: 'Metrics initialized successfully'
    })
  } catch (err) {
    console.error('[initializeMetricsHandler] Error:', err.message)
    next(err)
  }
}
