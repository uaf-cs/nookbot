import { CommandClient } from 'eris'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('kill', async msg => {
    await msg.channel.createMessage('ded')
    process.kill(process.pid, 'SIGTERM')
  }, {
    description: 'Restart the bot (pls don\'t do this without good reason ;~;)',
    requirements: {
      roleIDs: [process.env.CS_ADMIN]
    },
    permissionMessage: 'no u >:(\n(only admin can do this)'
  })
}

export default {
  init
}
