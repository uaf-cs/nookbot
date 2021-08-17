import { CommandClient, Message } from 'eris'

// Inlcude this so it's easier to get to redis
// eslint-disable-next-line
const { r } = require('../../config/redis')

export const init = (bot: CommandClient): void => {
  bot.registerCommand('evaluate', async (msg: Message, args: string[]): Promise<void> => {
    if (msg.author.id !== '250322741406859265') {
      await msg.channel.createMessage('<:catto:535716923225276416>')
      return
    }
    const isTyping = msg.channel.sendTyping()
    // Message content minus prefix
    let toEval = msg.content.replace(/\S+/, '').trim()
    if (toEval.startsWith('```')) {
      // Remove first line from message
      toEval = toEval.replace(/.*/, '').trim()
    }
    if (toEval.endsWith('```')) {
      toEval = toEval.substring(0, toEval.length - 3).trim()
    }
    const startTime = new Date()
    let res = ''
    let errored = false
    try {
      // eslint-disable-next-line no-eval
      res = await eval(toEval + ';')
    } catch (err) {
      errored = true
      res = err.toString()
    } finally {
      const endTime = new Date()
      const timeElapsed = (endTime.getTime() - startTime.getTime()) / 1000

      if (res === undefined || String(res).length === 0) {
        res = '[No Output]'
      }
      await isTyping
      await msg.channel.createMessage({
        embed: {
          color: errored ? 0xec282c : 0x31ada9,
          description: `\`\`\`js\n${res}\n\`\`\``,
          footer: {
            text: `Took ${timeElapsed} seconds`
          },
          title: errored ? 'Eval threw exception' : 'Eval result'
        }
      })
    }
  }, {
    aliases: ['eval'],
    hidden: true
  })
}

export default {
  init
}
