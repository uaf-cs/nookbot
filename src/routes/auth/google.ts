import { Router } from 'express'
import passport from 'passport'
import { OAuth2Strategy } from 'passport-google-oauth'

passport.use(new OAuth2Strategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: `${process.env.API_ROOT}/auth/google/callback`
}, (accessToken, refreshToken, profile, done) => {
  done(null, {
    google: profile
  })
}))

export const router = Router()

router.get('/', passport.authenticate('google', {
  scope: ['https://www.googleapis.com/auth/plus.login']
}))

router.get('/callback', passport.authenticate('google', {
  failureRedirect: 'error'
}), (req, res) => {
  res.redirect('../discord')
})

export default router
