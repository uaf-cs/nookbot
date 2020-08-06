import { Router } from 'express'

import auth from './auth'
import courses from './courses'
import me from './me'

const router = Router()

router.get('/', (req, res) => res.send({ user: req.user, session: req.session }))

router.use('/auth', auth)
router.use('/courses', courses)
router.use('/@me', me)

export default router
