import { Router } from 'express'

import discord from './discord'
import google from './google'

const router = Router()

router.use('/discord', discord)
router.use('/google', google)

router.get('/login', (req, res) => {
  req.logout()
  res.redirect('google')
})

router.get('/logout', (req, res) => {
  req.logout()
  res.redirect('/')
})

export default router
