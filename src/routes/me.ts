import { Router } from 'express'

import bot from '../config/bot'
import { r } from '../config/redis'

const router = Router()

router.use(async (req, res, next) => {
  if (req.isAuthenticated()) {
    // Update member session
    const member = bot.guilds.get(process.env.CS_GUILD).members.get(req.user.discord.id)
    if (member === undefined) {
      req.session.inGuild = false
    } else {
      req.session.inGuild = true

      if (!member.roles.includes(process.env.CS_APPROVED)) {
        await member.addRole(process.env.CS_APPROVED)
      }

      // Sync classes
      const classes = await r.lrange('class.list', 0, -1)
      req.session.classes = member.roles.filter(r => classes.includes(r))
      if (member.roles.includes(process.env.CS_STUDENT)) {
        req.session.status = 'student'
      } else if (member.roles.includes(process.env.CS_ALUMNUS)) {
        req.session.status = 'alumnus'
      } else if (member.roles.includes(process.env.CS_TEACHER)) {
        req.session.status = 'teacher'
      }
    }

    // Make sure their nick matches their name
    const { displayName } = req.user.google
    if (member.nick === undefined && req.session.status !== 'teacher') {
      try {
        await member.edit({
          nick: displayName
        })
        req.session.updatedNickname = true
      } catch {
        req.session.updatedNickname = false
      }
    } else {
      req.session.updatedNickname = true
    }
    next()
  } else {
    res.status(401)
    res.json({ error: 'not authenticated' })
  }
})

router.get('/', (req, res) => {
  const resp = {
    ...req.session
  }
  // Get rid of things we don't need to be there
  delete resp.cookie
  delete resp.passport
  res.json({
    ...req.user,
    ...resp
  })
})

router.post('/status', async (req, res) => {
  const { status } = req.body as { status: string }
  switch (status) {
    case 'student':
      await bot.addGuildMemberRole(
        process.env.CS_GUILD,
        req.user.discord.id,
        process.env.CS_STUDENT,
        'Assigning status role'
      )
      await bot.removeGuildMemberRole(
        process.env.CS_GUILD,
        req.user.discord.id,
        process.env.CS_ALUMNUS,
        'Removing status role'
      )
      break

    case 'alumnus':
      await bot.addGuildMemberRole(
        process.env.CS_GUILD,
        req.user.discord.id,
        process.env.CS_ALUMNUS,
        'Assigning status role'
      )
      await bot.removeGuildMemberRole(
        process.env.CS_GUILD,
        req.user.discord.id,
        process.env.CS_STUDENT,
        'Removing status role'
      )
      break

    default:
      res.status(400)
      res.json({ error: 'invalid status' })
  }
})

router.post('/courses/:id', async (req, res) => {
  const courseExists = await r.exists(`class:${req.params.id}`)
  if (courseExists === 0) {
    res.status(404)
    res.json({ error: 'course not found' })
  } else {
    await bot.addGuildMemberRole(
      process.env.CS_GUILD,
      req.user.discord.id,
      req.params.id,
      'Assigning class role'
    )
    res.status(200)
    res.json({ status: 'ok' })
  }
})

router.delete('/courses/:id', async (req, res) => {
  const courseExists = await r.exists(`class:${req.params.id}`)
  if (courseExists === 0) {
    res.status(404)
    res.json({ error: 'course not found' })
  } else {
    await bot.removeGuildMemberRole(
      process.env.CS_GUILD,
      req.user.discord.id,
      req.params.id,
      'Removing class role'
    )
    res.status(200)
    res.json({ status: 'ok' })
  }
})

export default router
