import axios from 'axios'
import { pool } from '../db/pool.js'
import { upsertMetricsFromML } from './metricsService.js'

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001'
const ML_TIMEOUT = Number.parseInt(process.env.ML_HTTP_TIMEOUT_MS || '8000', 10)
const FEATURE_COLUMNS = [
  'total_materi_selesai',
  'avg_durasi_materi_detik',
  'total_review',
  'total_hari_aktif',
  'std_dev_materi_harian',
  'avg_skor_kuis',
  'pass_rate_kuis',
  'total_kuis_diambil',
  'avg_rating_submission',
  'total_submissions'
]

function normalizeMlResponse(respData) {
  const ml = respData?.data
  if (!ml || typeof ml !== 'object') {
    throw Object.assign(
      new Error('Invalid ML response shape (missing `data`)'),
      { status: 502 }
    )
  }

  const learningStyle = ml.learning_style ?? ml.label ?? 'Unknown'
  const confidenceScore =
    typeof ml.confidence_score === 'number'
      ? ml.confidence_score
      : (typeof ml.confidence === 'number' ? ml.confidence : 0)

  const name = typeof ml.name === 'string' ? ml.name : null
  const userId = Number.isInteger(ml.user_id) ? ml.user_id : null
  const features =
    ml.features && typeof ml.features === 'object' ? ml.features : null

  return {
    learning_style: learningStyle,
    confidence_score: confidenceScore,
    name,
    user_id: userId,
    features
  }
}

export async function predictAndSave({ studentId }) {
  studentId = parseInt(studentId, 10)
  if (Number.isNaN(studentId)) {
    const err = new Error('studentId must be an integer')
    err.status = 400
    throw err
  }

  const resp = await axios.post(
    `${ML_BASE_URL}/predict`,
    { student_id: studentId },
    { timeout: ML_TIMEOUT }
  )

  const mlNorm = normalizeMlResponse(resp.data)
  const featuresFromMl = {}
  FEATURE_COLUMNS.forEach((col) => {
    const v =
      mlNorm.features && Object.prototype.hasOwnProperty.call(mlNorm.features, col)
        ? mlNorm.features[col]
        : 0
    featuresFromMl[col] = Number.isFinite(Number(v)) ? Number(v) : 0
  })

  const client = await pool.connect()
  try {
    await client.query('begin')
    await upsertMetricsFromML(studentId, featuresFromMl)
    await client.query(
      `insert into insight_histories
        (student_id, learning_style, confidence_score, created_at)
       values ($1, $2, $3, now())`,
      [
        studentId,
        mlNorm.learning_style,
        mlNorm.confidence_score
      ]
    )

    await client.query(
      `insert into insights
        (student_id, learning_style, confidence_score, updated_at)
       values ($1, $2, $3, now())
       on conflict (student_id) do update set
         learning_style   = excluded.learning_style,
         confidence_score = excluded.confidence_score,
         updated_at       = now()`,
      [
        studentId,
        mlNorm.learning_style,
        mlNorm.confidence_score
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
    student_id: studentId,
    learning_style: mlNorm.learning_style,
    confidence_score: mlNorm.confidence_score,
    name: mlNorm.name ?? null
  }
}

export async function getLastInsight(studentId) {
  studentId = parseInt(studentId, 10)
  const { rows } = await pool.query(
    `select
       student_id,
       learning_style,
       confidence_score,
       updated_at
     from insights
     where student_id = $1`,
    [studentId]
  )
  return rows[0] || null
}

export async function listHistory(studentId, limit = 20, offset = 0) {
  studentId = parseInt(studentId, 10)
  const { rows } = await pool.query(
    `select
       created_at,
       learning_style,
       confidence_score
     from insight_histories
     where student_id = $1
     order by created_at desc
     limit $2 offset $3`,
    [studentId, limit, offset]
  )
  return rows
}