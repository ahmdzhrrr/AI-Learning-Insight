import * as students from '../services/studentService.js'

export async function getMyProfile(req, res, next) {
  try {
    const data = await students.getByUserId(req.user.id)
    if (!data) return res.status(404).json({ status: 'fail', message: 'profil siswa tidak ditemukan' })
    return res.json({ status: 'success', data })
  } catch (err) { next(err) }
}