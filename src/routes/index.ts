import { Router } from 'express'

import auth from './auth'

const router = Router()

router.use('/auth', auth)
router.get('/', (req, res) => res.send({ user: req.user, session: req.session}))

export default router
