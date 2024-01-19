import { CommandClient, EmbedOptions } from 'eris'
import fetch from 'node-fetch'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('cat', async msg => {
    try {
      const req = await fetch('https://cataas.com/cat?json=true')
      if (req.ok) {
        const randomKitty = await req.json()
        await msg.channel.createMessage({
          embed: {
            image: {
              url: `https://cataas.com/cat/${randomKitty._id}`
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
    const embed: EmbedOptions = {}
    embed.image = {
      url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fb/Hotdog_-_Evan_Swigart.jpg/1200px-Hotdog_-_Evan_Swigart.jpg'
    }

    // Give Cam's favourite hotdog a chance to show up.
    if (Math.floor(Math.random() * 5) === 1) {
      try {
        const hotdog = await fetch('https://source.unsplash.com/featured/?hotdog', {
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
      const req = await fetch('https://source.unsplash.com/featured/?snowman', {
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

  bot.registerCommand('unsplash', async (msg, args) => {
    try {
      const req = await fetch(`https://source.unsplash.com/featured/?${encodeURI(args.join(','))}`, {
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
            description: "Hm, looks like I can't find any pictures right now :<",
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
    description: 'Gives a random image from unsplash based on keywords provided',
    usage: 'unsplash'
  })
}

export default {
  init
}
