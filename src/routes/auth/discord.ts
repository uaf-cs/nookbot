import { Router } from 'express'
import passport from 'passport'
import { Strategy } from 'passport-discord'

import bot from '../../config/bot'

passport.use(new Strategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: `${process.env.API_ROOT}/auth/discord/callback`,
  scope: ['identify'],
  passReqToCallback: true
}, (req, accessToken, refreshToken, profile, done) => {
  if (req.user?.google === undefined) {
    done(Error('must link google'))
  } else {
    done(null, { ...req.user, discord: profile })
  }
}))

export const router = Router()

router.get('/', passport.authenticate('discord'))

router.get('/callback', passport.authenticate('discord', {
  failureRedirect: 'error'
}), async (req, res) => {
  // Update member usernames
  const member = bot.guilds.get(process.env.CS_GUILD).members.get(req.user.discord.id)
  if (member === undefined) {
    req.session.inGuild = false
  } else {
    req.session.inGuild = true
    try {
      await member.edit({
        nick: req.user.google.displayName
      })
      req.session.updatedNickname = true
    } catch {
      req.session.updatedNickname = false
    }
  }
  res.redirect('/')
})

export default router
