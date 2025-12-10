import axios from 'axios'
import { pool } from '../db/pool.js'
import { getMetricsByDeveloperId } from '../services/metricsService.js'

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001'
const ML_PREDICT_PATH = process.env.ML_PREDICT_PATH || '/predict'
const ML_TIMEOUT = Number.parseInt(process.env.ML_HTTP_TIMEOUT_MS || '8000', 10)

const FEATURE_COLUMNS = [
  'total_active_days',
  'avg_completion_time_hours',
  'total_journeys_completed',
  'rejection_ratio',
  'avg_exam_score'
]

// Fallback learning styles berdasarkan metrics
const LEARNING_STYLE_RULES = [
  {
    name: 'High Achiever',
    condition: (m) => m.avg_exam_score >= 80 && m.total_journeys_completed >= 10,
    style: 'High Achiever',
    insight: 'Anda menunjukkan performa yang sangat baik dengan skor ujian tinggi dan banyak journey yang diselesaikan. Pertahankan konsistensi belajar Anda!',
    // Confidence dihitung berdasarkan seberapa tinggi nilai melampaui threshold
    calcConfidence: (m) => {
      const examFactor = Math.min((m.avg_exam_score - 80) / 20, 1) // 80-100 -> 0-1
      const journeyFactor = Math.min((m.total_journeys_completed - 10) / 20, 1) // 10-30 -> 0-1
      return 0.70 + (examFactor * 0.15) + (journeyFactor * 0.10) // Range: 0.70 - 0.95
    }
  },
  {
    name: 'Fast Learner',
    condition: (m) => m.total_active_days >= 30 && m.avg_completion_time_hours > 0 && m.avg_completion_time_hours <= 2,
    style: 'Fast Learner',
    insight: 'Anda memiliki konsistensi belajar yang baik dengan waktu penyelesaian yang cepat. Cobalah tantangan yang lebih kompleks untuk mengembangkan kemampuan Anda.',
    calcConfidence: (m) => {
      const daysFactor = Math.min((m.total_active_days - 30) / 70, 1) // 30-100 -> 0-1
      const speedFactor = Math.max(0, (2 - m.avg_completion_time_hours) / 2) // 0-2 -> 1-0
      return 0.65 + (daysFactor * 0.15) + (speedFactor * 0.12) // Range: 0.65 - 0.92
    }
  },
  {
    name: 'Careful Practitioner',
    condition: (m) => m.rejection_ratio <= 0.2 && m.total_submissions >= 10,
    style: 'Careful Practitioner',
    insight: 'Anda sangat teliti dalam mengerjakan tugas dengan tingkat penolakan yang rendah. Kualitas submission Anda sangat baik!',
    calcConfidence: (m) => {
      const rejectionFactor = Math.max(0, (0.2 - m.rejection_ratio) / 0.2) // 0.2-0 -> 0-1
      const submissionFactor = Math.min((m.total_submissions - 10) / 40, 1) // 10-50 -> 0-1
      return 0.60 + (rejectionFactor * 0.20) + (submissionFactor * 0.10) // Range: 0.60 - 0.90
    }
  },
  {
    name: 'Consistent Learner',
    condition: (m) => m.total_active_days >= 20,
    style: 'Consistent Learner',
    insight: 'Anda menunjukkan dedikasi yang baik dengan konsistensi belajar yang tinggi. Terus pertahankan rutinitas belajar Anda!',
    calcConfidence: (m) => {
      const daysFactor = Math.min((m.total_active_days - 20) / 80, 1) // 20-100 -> 0-1
      const examBonus = m.avg_exam_score > 50 ? 0.05 : 0
      return 0.55 + (daysFactor * 0.25) + examBonus // Range: 0.55 - 0.85
    }
  },
  {
    name: 'Steady Performer',
    condition: (m) => m.avg_exam_score >= 60,
    style: 'Steady Performer',
    insight: 'Performa Anda stabil dan menunjukkan pemahaman yang baik. Tingkatkan waktu belajar untuk hasil yang lebih optimal.',
    calcConfidence: (m) => {
      const examFactor = Math.min((m.avg_exam_score - 60) / 40, 1) // 60-100 -> 0-1
      const activityBonus = m.total_active_days > 10 ? 0.05 : 0
      return 0.50 + (examFactor * 0.25) + activityBonus // Range: 0.50 - 0.80
    }
  },
  {
    name: 'Emerging Learner',
    condition: () => true, // Default fallback
    style: 'Emerging Learner',
    insight: 'Anda sedang dalam proses pembelajaran. Terus tingkatkan aktivitas dan konsistensi belajar untuk hasil yang lebih baik.',
    calcConfidence: (m) => {
      // Base confidence untuk emerging learner lebih rendah
      const hasAnyData = (m.total_active_days > 0 || m.avg_exam_score > 0 || m.total_submissions > 0)
      if (!hasAnyData) return 0.40
      
      // Sedikit boost jika ada beberapa data
      const dataPoints = [
        m.total_active_days > 0,
        m.avg_exam_score > 0,
        m.total_submissions > 0,
        m.total_journeys_completed > 0
      ].filter(Boolean).length
      
      return 0.40 + (dataPoints * 0.05) // Range: 0.40 - 0.60
    }
  }
]

function determineLearningStyle(metrics) {
  const m = {
    total_active_days: Number(metrics?.total_active_days) || 0,
    avg_completion_time_hours: Number(metrics?.avg_completion_time_hours) || 0,
    total_journeys_completed: Number(metrics?.total_journeys_completed) || 0,
    rejection_ratio: Number(metrics?.rejection_ratio) || 0,
    avg_exam_score: Number(metrics?.avg_exam_score) || 0,
    total_submissions: Number(metrics?.total_submissions) || 0
  }

  for (const rule of LEARNING_STYLE_RULES) {
    if (rule.condition(m)) {
      // Calculate confidence using rule-specific formula
      const confidence = rule.calcConfidence(m)
      
      // Ensure confidence is within valid range
      const finalConfidence = Math.max(0.35, Math.min(0.95, confidence))
      
      console.log(`[determineLearningStyle] Matched: ${rule.name}, Confidence: ${finalConfidence.toFixed(2)}`)
      
      return {
        learning_style: rule.style,
        insight_text: rule.insight,
        confidence_score: Number(finalConfidence.toFixed(2))
      }
    }
  }
}

function normalizeMlResponse(respBody) {
  const ml = respBody?.data
  if (!ml || typeof ml !== 'object') {
    const err = new Error('Invalid ML response shape (missing `data`)')
    err.status = 502
    throw err
  }

  const learningStyle = ml.label ?? ml.learning_style ?? 'Unknown'

  const confidenceScore =
    typeof ml.confidence === 'number'
      ? ml.confidence
      : (typeof ml.confidence_score === 'number' ? ml.confidence_score : 0)

  const name =
    typeof ml.developer_name === 'string'
      ? ml.developer_name
      : (typeof ml.name === 'string' ? ml.name : null)

  const developerId =
    Number.isInteger(ml.developer_id)
      ? ml.developer_id
      : (Number.isInteger(ml.user_id) ? ml.user_id : null)

  const clusterId = Number.isInteger(ml.cluster_id) ? ml.cluster_id : null

  const features =
    ml.features && typeof ml.features === 'object' ? ml.features : null

  const insightText =
    typeof ml.insight_text === 'string' ? ml.insight_text : null

  return {
    learning_style: learningStyle,
    confidence_score: confidenceScore,
    name,
    developer_id: developerId,
    cluster_id: clusterId,
    features,
    insight_text: insightText
  }
}

async function callMLService(developerId, featuresPayload) {
  try {
    console.log(`[ML Service] Calling ${ML_BASE_URL}${ML_PREDICT_PATH} for developer ${developerId}`)
    
    const resp = await axios.post(
      `${ML_BASE_URL}${ML_PREDICT_PATH}`,
      { 
        developer_id: developerId,
        features: featuresPayload
      },
      { timeout: ML_TIMEOUT }
    )

    if (resp.data?.status !== 'success' || !resp.data.data) {
      console.warn('[ML Service] Invalid response:', resp.data?.message || 'Unknown error')
      return null
    }

    return normalizeMlResponse(resp.data)
  } catch (error) {
    // Log the error but don't throw - we'll use fallback
    if (error.code === 'ECONNREFUSED') {
      console.warn('[ML Service] Connection refused - service may be down')
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNABORTED') {
      console.warn('[ML Service] Request timeout')
    } else if (error.response) {
      console.warn(`[ML Service] HTTP ${error.response.status}: ${error.response.data?.message || 'Unknown error'}`)
    } else {
      console.warn('[ML Service] Error:', error.message)
    }
    return null
  }
}

export async function predictAndSave({ developerId }) {
  developerId = parseInt(developerId, 10)
  if (Number.isNaN(developerId)) {
    const err = new Error('developerId must be an integer')
    err.status = 400
    throw err
  }

  // Get existing metrics
  const metricsRow = await getMetricsByDeveloperId(developerId)

  let featuresPayload = null
  if (metricsRow) {
    featuresPayload = {
      total_active_days: metricsRow.total_active_days,
      avg_completion_time_hours: metricsRow.avg_completion_time_hours,
      total_journeys_completed: metricsRow.total_journeys_completed,
      rejection_ratio: metricsRow.rejection_ratio,
      avg_exam_score: metricsRow.avg_exam_score
    }
  }

  // Try ML service first
  let mlNorm = await callMLService(developerId, featuresPayload)
  let usedFallback = false

  // If ML service failed, use rule-based fallback
  if (!mlNorm) {
    console.log(`[Insights] Using fallback for developer ${developerId}`)
    usedFallback = true
    
    const fallbackResult = determineLearningStyle(metricsRow)
    mlNorm = {
      learning_style: fallbackResult.learning_style,
      confidence_score: fallbackResult.confidence_score,
      insight_text: fallbackResult.insight_text,
      name: null,
      developer_id: developerId,
      cluster_id: null,
      features: featuresPayload
    }
  }

  const effectiveDeveloperId = developerId || mlNorm.developer_id

  const featuresFromMl = {}
  FEATURE_COLUMNS.forEach((col) => {
    const v =
      mlNorm.features && Object.prototype.hasOwnProperty.call(mlNorm.features, col)
        ? mlNorm.features[col]
        : (metricsRow?.[col] ?? 0)
    featuresFromMl[col] = Number.isFinite(Number(v)) ? Number(v) : 0
  })

  const client = await pool.connect()
  try {
    await client.query('begin')

    const devCheck = await client.query(
      'select id, name from developers where id = $1',
      [effectiveDeveloperId]
    )

    if (devCheck.rowCount === 0) {
      const err = new Error('Developer not found in developers table')
      err.status = 404
      throw err
    }

    if (mlNorm.name) {
      await client.query(
        `
        update developers
        set name = $2
        where id = $1
        `,
        [effectiveDeveloperId, mlNorm.name]
      )
    }

    await client.query(
      `
      insert into learning_metrics (
        developer_id,
        total_active_days,
        avg_completion_time_hours,
        total_journeys_completed,
        rejection_ratio,
        avg_exam_score,
        cluster_label
      )
      values ($1, $2, $3, $4, $5, $6, $7)
      on conflict (developer_id) do update set
        total_active_days            = excluded.total_active_days,
        avg_completion_time_hours    = excluded.avg_completion_time_hours,
        total_journeys_completed     = excluded.total_journeys_completed,
        rejection_ratio              = excluded.rejection_ratio,
        avg_exam_score               = excluded.avg_exam_score,
        cluster_label                = excluded.cluster_label,
        updated_at                   = now()
      `,
      [
        effectiveDeveloperId,
        featuresFromMl.total_active_days,
        featuresFromMl.avg_completion_time_hours,
        featuresFromMl.total_journeys_completed,
        featuresFromMl.rejection_ratio,
        featuresFromMl.avg_exam_score,
        mlNorm.cluster_id
      ]
    )

    await client.query(
      `
      insert into insight_histories
        (developer_id, learning_style, confidence_score, insight_text, created_at)
      values ($1, $2, $3, $4, now())
      `,
      [
        effectiveDeveloperId,
        mlNorm.learning_style,
        mlNorm.confidence_score,
        mlNorm.insight_text
      ]
    )

    await client.query(
      `
      insert into insights
        (developer_id, learning_style, confidence_score, insight_text, updated_at)
      values ($1, $2, $3, $4, now())
      on conflict (developer_id) do update set
        learning_style   = excluded.learning_style,
        confidence_score = excluded.confidence_score,
        insight_text     = excluded.insight_text,
        updated_at       = now()
      `,
      [
        effectiveDeveloperId,
        mlNorm.learning_style,
        mlNorm.confidence_score,
        mlNorm.insight_text
      ]
    )

    await client.query('commit')
  } catch (e) {
    await client.query('rollback')
    throw e
  } finally {
    client.release()
  }

  return {
    developer_id: effectiveDeveloperId,
    learning_style: mlNorm.learning_style,
    confidence_score: mlNorm.confidence_score,
    name: mlNorm.name ?? null,
    cluster_id: mlNorm.cluster_id,
    cluster_label: mlNorm.cluster_id,
    insight_text: mlNorm.insight_text ?? null,
    features: featuresFromMl,
    used_fallback: usedFallback
  }
}

export async function getLastInsight(developerId) {
  developerId = parseInt(developerId, 10)
  
  if (Number.isNaN(developerId)) {
    const err = new Error('developerId must be an integer')
    err.status = 400
    throw err
  }

  try {
    const { rows } = await pool.query(
      `
      select
        i.developer_id,
        d.name,
        i.learning_style,
        i.confidence_score,
        i.insight_text,
        i.updated_at,
        lm.cluster_label
      from insights i
      join developers d on d.id = i.developer_id
      left join learning_metrics lm on lm.developer_id = i.developer_id
      where i.developer_id = $1
      `,
      [developerId]
    )
    return rows[0] || null
  } catch (error) {
    console.error('[getLastInsight] Database error:', error.message)
    throw error
  }
}

export async function listHistory(developerId, limit = 20, offset = 0) {
  developerId = parseInt(developerId, 10)
  
  if (Number.isNaN(developerId)) {
    const err = new Error('developerId must be an integer')
    err.status = 400
    throw err
  }

  try {
    const { rows } = await pool.query(
      `
      select
        created_at,
        learning_style,
        confidence_score,
        insight_text
      from insight_histories
      where developer_id = $1
      order by created_at desc
      limit $2 offset $3
      `,
      [developerId, limit, offset]
    )
    return rows
  } catch (error) {
    console.error('[listHistory] Database error:', error.message)
    throw error
  }
}

// New function to generate insight without saving (for preview)
export async function generateInsightPreview(developerId) {
  developerId = parseInt(developerId, 10)
  
  if (Number.isNaN(developerId)) {
    const err = new Error('developerId must be an integer')
    err.status = 400
    throw err
  }

  const metricsRow = await getMetricsByDeveloperId(developerId)
  
  if (!metricsRow) {
    return {
      developer_id: developerId,
      learning_style: 'New Learner',
      confidence_score: 0.5,
      insight_text: 'Mulailah perjalanan belajar Anda untuk mendapatkan insight yang lebih akurat.',
      features: null
    }
  }

  const fallbackResult = determineLearningStyle(metricsRow)
  
  return {
    developer_id: developerId,
    learning_style: fallbackResult.learning_style,
    confidence_score: fallbackResult.confidence_score,
    insight_text: fallbackResult.insight_text,
    features: {
      total_active_days: metricsRow.total_active_days,
      avg_completion_time_hours: metricsRow.avg_completion_time_hours,
      total_journeys_completed: metricsRow.total_journeys_completed,
      rejection_ratio: metricsRow.rejection_ratio,
      avg_exam_score: metricsRow.avg_exam_score
    }
  }
}
