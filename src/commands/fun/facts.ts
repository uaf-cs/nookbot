import { CommandClient } from 'eris'
import fetch from 'node-fetch'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('fact', async msg => {
    const req = await fetch('https://uselessfacts.jsph.pl/random.json?language=en')
    if (req.ok) {
      const randomFact = await req.json()
      await msg.channel.createMessage({
        embed: {
          description: randomFact.text
        }
      })
    } else {
      await msg.channel.createMessage({
        embed: {
          description: "Hm, looks like I can't find any facts right now :<",
          footer: {
            text: `HTTP error ${req.status}`
          }
        }
      })
    }
  }, {
    description: 'Gives a random fact',
    usage: 'fact'
  })
}

export default {
  init
}
