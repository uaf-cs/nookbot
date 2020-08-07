import { CommandClient } from 'eris'

const bot = new CommandClient(process.env.DISCORD_TOKEN, {}, {
  prefix: ['@mention', '!'],
  description: 'Utilties for UAF-CS',
  owner: 'UAF Students'
})
// It'd be nice to know if the bot is ready or not
bot.on('ready', () => {
  const { username, discriminator } = bot.user
  console.log(`Connected to Discord as ${username}#${discriminator}`)
})

export default bot
