import { pool } from '../db/pool.js'

const FEATURE_COLUMNS = [
  'total_active_days',
  'avg_completion_time_hours',
  'total_journeys_completed',
  'total_submissions',
  'rejected_submissions',
  'avg_exam_score',
  'rejection_ratio',
  'cluster_label'
]

export async function upsertLearningMetrics (developerId, metrics) {
  developerId = parseInt(developerId, 10)
  if (Number.isNaN(developerId)) {
    const err = new Error('developerId must be an integer')
    err.status = 400
    throw err
  }

  const cols = FEATURE_COLUMNS
  const values = cols.map((c) => {
    const v = metrics?.[c]
    return Number.isFinite(Number(v)) ? Number(v) : 0
  })

  const placeholders = values.map((_, i) => `$${i + 2}`)

  await pool.query(
    `
    insert into learning_metrics (
      developer_id,
      ${cols.join(', ')},
      created_at,
      updated_at
    )
    values (
      $1,
      ${placeholders.join(', ')},
      now(),
      now()
    )
    on conflict (developer_id) do update set
      ${cols.map((c) => `${c} = excluded.${c}`).join(', ')},
      updated_at = now()
    `,
    [developerId, ...values]
  )
}

export async function getMetricsByDeveloperId (developerId) {
  developerId = parseInt(developerId, 10)
  const { rows } = await pool.query(
    `
    select
      developer_id,
      ${FEATURE_COLUMNS.join(', ')},
      created_at,
      updated_at
    from learning_metrics
    where developer_id = $1
    `,
    [developerId]
  )

  return rows[0] || null
}

export async function getByUserId (userId) {
  return getMetricsByDeveloperId(userId)
}

export async function upsertDirect ({ developerId, metrics }) {
  await upsertLearningMetrics(developerId, metrics)
  return getMetricsByDeveloperId(developerId)
}

export async function getOverviewMetrics (developerId) {
  const row = await getMetricsByDeveloperId(developerId)

  if (!row) return null

  const totalActiveDays = Number(row.total_active_days || 0)
  const totalJourneys = Number(row.total_journeys_completed || 0)
  const estimatedWeeklyCompleted =
    totalActiveDays > 0 ? (totalJourneys / totalActiveDays) * 7 : 0

  return {
    developerId: row.developer_id,
    avgStudyTimeHours: Number(row.avg_completion_time_hours || 0),
    totalActiveDays,
    totalJourneysCompleted: totalJourneys,
    totalSubmissions: Number(row.total_submissions || 0),
    rejectedSubmissions: Number(row.rejected_submissions || 0),
    avgExamScore: Number(row.avg_exam_score || 0),
    rejectionRatio: Number(row.rejection_ratio || 0),
    clusterLabel: row.cluster_label,
    estimatedWeeklyCompleted
  }
}

export async function getWeeklyProgress (developerId) {
  developerId = parseInt(developerId, 10)

  const sql = `
    select
      date_trunc('week', created_at)::date as week_start,
      avg(confidence_score)                as avg_confidence,
      count(*)                             as total_insights
    from insight_histories
    where developer_id = $1
    group by week_start
    order by week_start;
  `
  const { rows } = await pool.query(sql, [developerId])

  return rows.map(r => ({
    weekStart: r.week_start,
    avgConfidence: Number(r.avg_confidence || 0),
    totalInsights: Number(r.total_insights || 0)
  }))
}

export async function getHistoricalPerformance (developerId) {
  developerId = parseInt(developerId, 10)

  const sql = `
    select
      created_at,
      learning_style,
      confidence_score,
      insight_text
    from insight_histories
    where developer_id = $1
    order by created_at;
  `
  const { rows } = await pool.query(sql, [developerId])

  return rows.map(r => ({
    createdAt: r.created_at,
    learningStyle: r.learning_style,
    confidenceScore: Number(r.confidence_score || 0),
    insightText: r.insight_text
  }))
}
