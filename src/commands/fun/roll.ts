import { CommandClient } from 'eris'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('roll', async (msg, [num]) => {
    const number = Number(num)
    if (isNaN(number)) {
      await msg.channel.createMessage('Proper usage is `!roll 20`')
    } else {
      const roll = Math.ceil(Math.random() * number)
      await msg.channel.createMessage(roll.toString())
    }
  })
}

export default {
  init
}
