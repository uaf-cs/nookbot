// Allows us to get proper line number in stacktraces
import 'source-map-support/register'

import connectRedis from 'connect-redis'
import express from 'express'
import sessions from 'express-session'
import passport from 'passport'

import bot from './config/bot'
import commands from './commands'
import { r } from './config/redis'
import routes from './routes'

const web = express()
// Lets us consume JSON POSTs
web.use(express.json())

// Init session store
const RedisStore = connectRedis(sessions)
const sessionStore = sessions({
  store: new RedisStore({ client: r }),
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false
})
web.use(sessionStore)

// Passport login management
passport.serializeUser((user, done) => {
  done(null, JSON.stringify(user))
})

passport.deserializeUser((user: string, done) => {
  done(null, JSON.parse(user))
})

web.use(passport.initialize())
web.use(passport.session())

// Load our routes
web.use(routes)

// Serve our amazing API
const server = web.listen(80)

// Load all our commands
commands.init(bot)

// Connect to Discord
bot.connect()
  .catch(console.error)

// Cleanly shut things down
process.on('SIGTERM', () => {
  server.close()
  bot.disconnect({
    reconnect: false
  })
})
