// Allows us to get proper line number in stacktraces
import 'source-map-support/register'

import { CommandClient } from 'eris'

import commands from './commands'

const bot = new CommandClient(process.env.DISCORD_TOKEN)

bot.on('ready', () => {
  const { username, discriminator } = bot.user
  console.log(`Connected to Discord as ${username}#${discriminator}`)
})

commands.init(bot)

process.on('SIGTERM', () => {
  bot.disconnect({
    reconnect: false
  })
})

bot.connect()
  .catch(console.error)
