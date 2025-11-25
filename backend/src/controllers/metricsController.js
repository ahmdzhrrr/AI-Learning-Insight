import * as metrics from '../services/metricsService.js'
import { getOverviewMetrics, getWeeklyProgress, getHistoricalPerformance } from '../services/metricsService.js'

function getDeveloperIdFromParams (req) {
  return req.params.developerId ?? req.params.userId
}

export async function getMetrics (req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)
    const data = await metrics.getByUserId(rawId)

    if (!data) {
      return res
        .status(404)
        .json({ status: 'fail', message: 'metrics not found' })
    }

    res.json({ status: 'success', data: { metrics: data } })
  } catch (e) {
    next(e)
  }
}

export async function upsertMetrics (req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)

    const data = await metrics.upsertDirect({
      developerId: rawId,
      metrics: req.body
    })

    res.json({ status: 'success', data: { metrics: data } })
  } catch (e) {
    next(e)
  }
}

export async function getMetricsOverview (req, res, next) {
  try {
    const developerId = req.params.developerId || req.user.id
    const data = await getOverviewMetrics(developerId)

    if (!data) {
      return res.status(404).json({
        status: 'fail',
        message: 'Metrics not found'
      })
    }

    res.json({
      status: 'success',
      data
    })
  } catch (err) {
    next(err)
  }
}

export async function getWeeklyProgressHandler (req, res, next) {
  try {
    const developerId = req.params.developerId || req.user.id
    const data = await getWeeklyProgress(developerId)

    res.json({
      status: 'success',
      data
    })
  } catch (err) {
    next(err)
  }
}

export async function getHistoricalPerformanceHandler (req, res, next) {
  try {
    const developerId = req.params.developerId || req.user.id
    const data = await getHistoricalPerformance(developerId)

    res.json({
      status: 'success',
      data
    })
  } catch (err) {
    next(err)
  }
}
