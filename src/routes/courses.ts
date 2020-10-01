import { Router } from 'express'
import { r } from '../config/redis'

const router = Router()

router.get('/', async (req, res) => {
  const courses = await r.lrange('class.list', 0, -1)
  const promiseDetails = courses.map(async c => ({ id: c, raw: await r.get(`class:${c}`) }))
  const details = await Promise.all(promiseDetails)
  res.json(details.map(c => ({ id: c.id, ...JSON.parse(c.raw) })))
})

export default router
