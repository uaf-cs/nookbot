import { Router } from 'express'
import fetch from 'node-fetch'
import passport from 'passport'
import { Strategy } from 'passport-discord'

import bot from '../../config/bot'

passport.use(new Strategy({
  clientID: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  callbackURL: `${process.env.API_ROOT}/auth/discord/callback`,
  scope: ['identify', 'guilds.join'],
  passReqToCallback: true
}, async (req, accessToken, refreshToken, profile, done) => {
  if (req.user?.google === undefined) {
    done(Error('must link google'))
  } else {
    await fetch(`https://discord.com/api/guilds/${process.env.CS_GUILD}/members/${profile.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bot ${process.env.DISCORD_TOKEN}`
      },
      body: JSON.stringify({ access_token: accessToken })
    })
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
  }
  res.redirect('/')
})

export default router
