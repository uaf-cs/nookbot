import { Router } from 'express'
import { r } from '../config/redis'

const router = Router()

router.get('/', async (req, res) => {
  const courses = await r.lrange('class.list', 0, -1)
  const promiseDetails = courses.map(async c => ({ id: c, raw: await r.get(`class:${c}`) }))
  const details = await Promise.all(promiseDetails)

  const subjectIds = await r.lrange('subject.list', 0, -1)
  const subjects = await Promise.all(subjectIds.map(async s => ({ id: s, name: await r.get(`subject:${s}`) })))
  res.json({
    courses: details.map(c => ({ id: c.id, ...JSON.parse(c.raw) })),
    subjects
  })
})

export default router
