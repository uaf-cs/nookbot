import { CommandClient } from 'eris'
import fetch from 'node-fetch'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('cat', async msg => {
    const req = await fetch('https://aws.random.cat/meow')
    if (req.ok) {
      const randomKitty = await req.json()
      await msg.channel.createMessage({
        embed: {
          image: {
            url: randomKitty.file
          }
        }
      })
    } else {
      await msg.channel.createMessage({
        embed: {
          description: "Hm, looks like I can't find any cats right now <:catto:535716923225276416>",
          footer: {
            text: `HTTP error ${req.status}`
          }
        }
      })
    }
  }, {
    description: 'Gives a random cat',
    usage: 'cat'
  })

  bot.registerCommand('dog', async msg => {
    const req = await fetch('https://dog.ceo/api/breeds/image/random')
    if (req.ok) {
      const randomDog = await req.json()
      await msg.channel.createMessage({
        embed: {
          image: {
            url: randomDog.message
          }
        }
      })
    } else {
      await msg.channel.createMessage({
        embed: {
          description: "Hm, looks like I can't find any dogs right now :<",
          footer: {
            text: `HTTP error ${req.status}`
          }
        }
      })
    }
  }, {
    description: 'Gives a random dog',
    usage: 'dog'
  })

  bot.registerCommand('hotdog', async msg => {
    await msg.channel.createMessage({
      embed: {
        image: {
          url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hotdog_-_Evan_Swigart.jpg/1200px-Hotdog_-_Evan_Swigart.jpg'
        }
      }
    })
  }, {
    description: 'Gives a random hotdog',
    usage: 'hotdog'
  })
}

export default {
  init
}
