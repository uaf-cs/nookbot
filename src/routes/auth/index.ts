import { Router } from 'express'

import discord from './discord'
import google from './google'

const router = Router()

router.use('/discord', discord)
router.use('/google', google)

export default router
