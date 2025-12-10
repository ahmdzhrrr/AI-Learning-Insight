import * as insights from '../services/insightsService.js'

function getDeveloperIdFromParams(req) {
  return req.params.developerId ?? req.params.userId
}

export async function createOrUpdateInsight(req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)
    const developerId = parseInt(rawId, 10)
    
    if (Number.isNaN(developerId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const result = await insights.predictAndSave({
      developerId: developerId
    })

    res.json({
      status: 'success',
      data: { insight: result }
    })
  } catch (e) {
    console.error('[createOrUpdateInsight] Error:', e.message)
    
    // Handle specific error types
    if (e.status === 404) {
      return res.status(404).json({
        status: 'fail',
        message: e.message || 'Developer not found'
      })
    }
    
    if (e.status === 400) {
      return res.status(400).json({
        status: 'fail',
        message: e.message || 'Invalid request'
      })
    }

    next(e)
  }
}

export async function getInsight(req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)
    const developerId = parseInt(rawId, 10)
    
    if (Number.isNaN(developerId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    // First try to get existing insight
    let data = await insights.getLastInsight(developerId)
    
    // If no existing insight, generate new one
    if (!data) {
      console.log(`[getInsight] No existing insight for developer ${developerId}, generating new one`)
      
      try {
        data = await insights.predictAndSave({ developerId })
      } catch (predictError) {
        console.error('[getInsight] Failed to generate insight:', predictError.message)
        
        // If prediction fails, try to get a preview insight (fallback)
        if (predictError.status === 404) {
          return res.status(404).json({
            status: 'fail',
            message: 'Developer not found'
          })
        }
        
        // Try fallback preview
        try {
          data = await insights.generateInsightPreview(developerId)
          data.is_preview = true
        } catch (previewError) {
          console.error('[getInsight] Preview also failed:', previewError.message)
          
          // Return a default insight
          data = {
            developer_id: developerId,
            learning_style: 'Learner',
            confidence_score: 0.5,
            insight_text: 'Sedang menganalisis pola belajar Anda. Silakan coba lagi nanti.',
            is_fallback: true
          }
        }
      }
    }

    res.json({
      status: 'success',
      data: { insight: data }
    })
  } catch (e) {
    console.error('[getInsight] Unexpected error:', e.message)
    
    if (e.status === 404) {
      return res.status(404).json({
        status: 'fail',
        message: e.message || 'Developer not found'
      })
    }
    
    if (e.status === 400) {
      return res.status(400).json({
        status: 'fail',
        message: e.message || 'Invalid request'
      })
    }

    next(e)
  }
}

// New endpoint for getting insight history
export async function getInsightHistory(req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)
    const developerId = parseInt(rawId, 10)
    
    if (Number.isNaN(developerId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const limit = parseInt(req.query.limit, 10) || 20
    const offset = parseInt(req.query.offset, 10) || 0

    const history = await insights.listHistory(developerId, limit, offset)

    res.json({
      status: 'success',
      data: { 
        history,
        pagination: {
          limit,
          offset,
          count: history.length
        }
      }
    })
  } catch (e) {
    console.error('[getInsightHistory] Error:', e.message)
    next(e)
  }
}

// New endpoint for preview insight without saving
export async function previewInsight(req, res, next) {
  try {
    const rawId = getDeveloperIdFromParams(req)
    const developerId = parseInt(rawId, 10)
    
    if (Number.isNaN(developerId)) {
      return res.status(400).json({
        status: 'fail',
        message: 'developerId must be a valid integer'
      })
    }

    const preview = await insights.generateInsightPreview(developerId)

    res.json({
      status: 'success',
      data: { 
        insight: preview,
        is_preview: true
      }
    })
  } catch (e) {
    console.error('[previewInsight] Error:', e.message)
    
    if (e.status === 400) {
      return res.status(400).json({
        status: 'fail',
        message: e.message
      })
    }

    next(e)
  }
}
