import { pool } from '../db/pool.js'
function classifyFromMetrics(m) {
  const study_hours = Number(m.study_hours ?? 0)
  const attendance = Number(m.attendance ?? 0)
  const assignment = Number(m.assignment_completion ?? 0)
  const motivation = Number(m.motivation ?? 0)
  const stress = Number(m.stress_level ?? 0)
  const discussions = Number(m.discussions ?? 0)
  const resources = Number(m.resources ?? 0)

  // FAST → belajar cepat, jam belajar sedikit tapi hasil bagus
  let fastScore = 0
  const fastReasons = []
  if (study_hours <= 2) { fastScore += 2; fastReasons.push({ key: 'study_hours', op: '<=', value: 2, actual: study_hours }) }
  if (assignment >= 4) { fastScore += 1; fastReasons.push({ key: 'assignment_completion', op: '>=', value: 4, actual: assignment }) }
  if (motivation >= 4) { fastScore += 1; fastReasons.push({ key: 'motivation', op: '>=', value: 4, actual: motivation }) }
  if (attendance >= 3) { fastScore += 0.5; fastReasons.push({ key: 'attendance', op: '>=', value: 3, actual: attendance }) }
  if (stress <= 3) { fastScore += 0.5; fastReasons.push({ key: 'stress_level', op: '<=', value: 3, actual: stress }) }

  // CONSISTENT → rajin & stabil
  let consistentScore = 0
  const consistentReasons = []
  if (attendance >= 4) { consistentScore += 1.5; consistentReasons.push({ key: 'attendance', op: '>=', value: 4, actual: attendance }) }
  if (assignment >= 4) { consistentScore += 1.5; consistentReasons.push({ key: 'assignment_completion', op: '>=', value: 4, actual: assignment }) }
  if (study_hours >= 2 && study_hours <= 4) {
    consistentScore += 1
    consistentReasons.push({ key: 'study_hours', op: 'between', value: [2, 4], actual: study_hours })
  }
  if (discussions >= 2) { consistentScore += 0.5; consistentReasons.push({ key: 'discussions', op: '>=', value: 2, actual: discussions }) }
  if (resources >= 2) { consistentScore += 0.5; consistentReasons.push({ key: 'resources', op: '>=', value: 2, actual: resources }) }
  if (stress >= 2 && stress <= 4) {
    consistentScore += 0.5
    consistentReasons.push({ key: 'stress_level', op: 'between', value: [2, 4], actual: stress })
  }

  // REFLECTIVE → jam belajar tinggi, aktif diskusi & sumber
  let reflectiveScore = 0
  const reflectiveReasons = []
  if (study_hours >= 4) { reflectiveScore += 1.5; reflectiveReasons.push({ key: 'study_hours', op: '>=', value: 4, actual: study_hours }) }
  if (resources >= 4) { reflectiveScore += 1; reflectiveReasons.push({ key: 'resources', op: '>=', value: 4, actual: resources }) }
  if (discussions >= 4) { reflectiveScore += 1; reflectiveReasons.push({ key: 'discussions', op: '>=', value: 4, actual: discussions }) }
  if (motivation >= 4) { reflectiveScore += 0.5; reflectiveReasons.push({ key: 'motivation', op: '>=', value: 4, actual: motivation }) }
  if (stress <= 3) { reflectiveScore += 0.5; reflectiveReasons.push({ key: 'stress_level', op: '<=', value: 3, actual: stress }) }

  // Pilih label dengan skor tertinggi
  const scores = [
    { label: 'Fast', score: fastScore, reasons: fastReasons },
    { label: 'Consistent', score: consistentScore, reasons: consistentReasons },
    { label: 'Reflective', score: reflectiveScore, reasons: reflectiveReasons }
  ].sort((a, b) => b.score - a.score)

  const top = scores[0]
  const total = scores[0].score + scores[1].score + scores[2].score
  const confidence = total > 0 ? Number((top.score / total).toFixed(2)) : 0.8
  const reasons = top.reasons.slice(0, 3).map(r => ({
    key: r.key,
    op: r.op,
    value: r.value,
    actual: r.actual
  }))

  return { label: top.label, confidence, reasons }
}

/**
 * Ambil insight terbaru:
 * - mode 'db'  : ambil dari tabel insights
 * - mode 'rule': hitung dari metrics terbaru
 * - mode 'mock': dummy
 */
export async function getLatest(studentId, mode = 'rule') {
  // Mode 1: DB
  if (mode === 'db') {
    const { rows } = await pool.query(
      `SELECT id, label, confidence, reasons, updated_at
       FROM insights
       WHERE student_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [studentId]
    )
    if (rows[0]) return rows[0]
  }

  // Mode 2: Rule-based
  if (mode === 'rule') {
    const { rows: mrows } = await pool.query(
      `SELECT study_hours, attendance, assignment_completion, motivation, stress_level, discussions, resources, updated_at
       FROM metrics
       WHERE student_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [studentId]
    )

    if (!mrows[0]) {
      return {
        label: 'Consistent',
        confidence: 0.5,
        reasons: [{ key: 'data', op: 'missing', value: 'metrics' }],
        updated_at: new Date().toISOString()
      }
    }

    const pred = classifyFromMetrics(mrows[0])
    return { ...pred, updated_at: mrows[0].updated_at ?? new Date().toISOString() }
  }

  // Mode 3: Mock
  if (mode === 'mock') {
    function mockInsight() {
      const labels = ['Fast', 'Consistent', 'Reflective']
      const label = labels[Math.floor(Math.random() * labels.length)]
      const reasons = [{ key: 'study_hours', op: '>=', value: 3 }]
      return { label, confidence: 0.8, reasons }
    }
    const { rows } = await pool.query(
      `SELECT id, label, confidence, reasons, updated_at
       FROM insights
       WHERE student_id = $1
       ORDER BY updated_at DESC
       LIMIT 1`,
      [studentId]
    )
    return rows[0] || { ...mockInsight(), updated_at: new Date().toISOString() }
  }

  // Default
  const { rows } = await pool.query(
    `SELECT id, label, confidence, reasons, updated_at
     FROM insights
     WHERE student_id = $1
     ORDER BY updated_at DESC
     LIMIT 1`,
    [studentId]
  )
  return rows[0] || null
}