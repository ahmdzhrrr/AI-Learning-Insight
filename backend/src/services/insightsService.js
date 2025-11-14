import axios from 'axios'
import { pool } from '../db/pool.js'
import { getByUserId as getMetricsByUserId } from './metricsService.js'

const ML_BASE_URL = process.env.ML_SERVICE_URL || 'http://127.0.0.1:8001'
const ML_TIMEOUT = Number.parseInt(process.env.ML_HTTP_TIMEOUT_MS || '8000', 10)

function normalizeMlResponse(respData) {
  const ml = respData?.data
  if (!ml || typeof ml !== 'object') {
    throw Object.assign(new Error('Invalid ML response shape (missing `data`)'), { status: 502 })
  }

  const label      = ml.label ?? 'Unknown'
  const confidence = typeof ml.confidence === 'number' ? ml.confidence : 0
  const reasons    = Array.isArray(ml.reasons) ? ml.reasons : []
  const clusterId  = Number.isInteger(ml.cluster_id) ? ml.cluster_id : -1
  const name       = typeof ml.name === 'string' ? ml.name : null
  const userId     = Number.isInteger(ml.user_id) ? ml.user_id : null

  return { label, confidence, reasons, cluster_id: clusterId, name, user_id: userId }
}

/**
 * Bangun payload fitur (metrics) dari DB kalau caller tidak memberi `features`.
 */
async function buildFeaturesForUser(userId) {
  const m = await getMetricsByUserId(userId)
  if (!m) {
    const err = new Error('metrics not found for user'); err.status = 400
    throw err
  }
  return {
    study_hours: m.study_hours,
    attendance: m.attendance,
    assignment_completion: m.assignment_completion,
    motivation: m.motivation,
    stress_level: m.stress_level,
    discussions: m.discussions,
    resources: m.resources,
  }
}

export async function predictAndSave({ userId, features, useDbMetricsFallback = true }) {
  let payload = features
  if (!payload) {
    if (!useDbMetricsFallback) {
      const err = new Error('features is required when useDbMetricsFallback=false'); err.status = 400
      throw err
    }
    payload = await buildFeaturesForUser(userId)
  }
  
  const resp = await axios.post(
    `${ML_BASE_URL}/predict`,
    { student_id: userId, features: payload },
    { timeout: ML_TIMEOUT }
  )

  const mlNorm = normalizeMlResponse(resp.data)

  const client = await pool.connect()
  try {
    await client.query('begin')
    await client.query(
      `insert into insight_histories
        (student_id, label, confidence, reasons, raw_features, cluster_id, created_at)
       values ($1,$2,$3,$4::jsonb,$5::jsonb,$6, now())`,
      [
        userId,
        mlNorm.label,
        mlNorm.confidence,
        JSON.stringify(mlNorm.reasons),
        JSON.stringify(payload),
        mlNorm.cluster_id,
      ]
    )
    await client.query(
      `insert into insights (student_id, label, confidence, reasons, cluster_id, updated_at)
       values ($1,$2,$3,$4::jsonb,$5, now())
       on conflict (student_id) do update set
         label=excluded.label,
         confidence=excluded.confidence,
         reasons=excluded.reasons,
         cluster_id=excluded.cluster_id,
         updated_at=now()`,
      [
        userId,
        mlNorm.label,
        mlNorm.confidence,
        JSON.stringify(mlNorm.reasons),
        mlNorm.cluster_id,
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
    label: mlNorm.label,
    confidence: mlNorm.confidence,
    reasons: mlNorm.reasons,
    cluster_id: mlNorm.cluster_id,
    user_id: userId ?? mlNorm.user_id ?? null,
    name: mlNorm.name ?? null,
  }
}

export async function getLastInsight(userId) {
  const { rows } = await pool.query(
    `select student_id, label, confidence, reasons, cluster_id, updated_at
       from insights
      where student_id = $1`,
    [userId]
  )
  return rows[0] || null
}

export async function listHistory(userId, limit = 20, offset = 0) {
  const { rows } = await pool.query(
    `select created_at, label, confidence, reasons, cluster_id, raw_features
       from insight_histories
      where student_id = $1
      order by created_at desc
      limit $2 offset $3`,
    [userId, limit, offset]
  )
  return rows
}
