import { CommandClient, EmbedOptions } from 'eris'
import fetch from 'node-fetch'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('cat', async msg => {
    try {
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
    } catch (error) {
      await msg.channel.createMessage(`Something went very wrong and I wasn't able to make the request.\n\`${(error as Error).message}\``)
    }
  }, {
    description: 'Gives a random cat',
    usage: 'cat'
  })

  bot.registerCommand('dog', async msg => {
    try {
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
    } catch (error) {
      await msg.channel.createMessage(`Something went very wrong and I wasn't able to make the request.\n\`${(error as Error).message}\``)
    }
  }, {
    description: 'Gives a random dog',
    usage: 'dog'
  })

  bot.registerCommand('hotdog', async msg => {
    const embed: EmbedOptions = {
      image: {
        url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hotdog_-_Evan_Swigart.jpg/1200px-Hotdog_-_Evan_Swigart.jpg'
      }
    }

    // Give Cam's favourite hotdog a chance to show up.
    if (Math.floor(Math.random() * 2) === 1) {
      try {
        const hotdog = await fetch('https://source.unsplash.com/1600x900/?hotdog', {
          method: 'HEAD'
        })
        embed.image.url = hotdog.url
      } catch (err) {
        // If it fails we don't really care, since we already have the placeholder
      }
    }

    await msg.channel.createMessage({ embed })
  }, {
    description: 'Gives a random hotdog',
    usage: 'hotdog'
  })

  bot.registerCommand('snowman', async msg => {
    try {
      const req = await fetch('https://source.unsplash.com/1600x900/?snowman', {
        method: 'HEAD'
      })
      if (req.ok) {
        await msg.channel.createMessage({
          embed: {
            image: {
              url: req.url
            }
          }
        })
      } else {
        await msg.channel.createMessage({
          embed: {
            description: "Hm, looks like I can't find any snowmen right now :<",
            footer: {
              text: `HTTP error ${req.status}`
            }
          }
        })
      }
    } catch (error) {
      await msg.channel.createMessage(`Something went very wrong and I wasn't able to make the request.\n\`${(error as Error).message}\``)
    }
  }, {
    description: 'Gives a random snowman',
    usage: 'snowman'
  })
}

export default {
  init
}
