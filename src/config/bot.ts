import { CommandClient, Message, Channel, User } from 'eris'

const bot = new CommandClient(process.env.DISCORD_TOKEN, {
  intents: [
    'guilds',
    'guildMembers',
    'guildMessages'
  ],
  getAllUsers: true
}, {
  prefix: ['@mention', '!'],
  description: 'Utilties for UAF-CS',
  owner: 'UAF Students'
})

// It'd be nice to know if the bot is ready or not
bot.on('ready', () => {
  const { username, discriminator } = bot.user
  console.log(`Connected to Discord as ${username}#${discriminator}`)
})

export const getReply = async (chan: Channel, user: User): Promise<Message> => {
  return await new Promise((resolve, reject) => {
    const listener = (msgEv: Message): void => {
      if (msgEv.channel === chan && msgEv.author === user) {
        bot.off('messageCreate', listener)
        resolve(msgEv)
      }
    }
    bot.on('messageCreate', listener)
  })
}

export default bot
