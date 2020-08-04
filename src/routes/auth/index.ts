import { Router } from 'express'

import google from './google'

const router = Router()

router.use('/google', google)

export default router
