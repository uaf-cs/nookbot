import { CommandClient, EmbedOptions } from 'eris'
import { URL } from 'url'

function generateEmbed (expr: string): EmbedOptions {
  const renderURL = new URL('https://math.katlyn.dev/render')
  renderURL.searchParams.append('input', 'latex')
  renderURL.searchParams.append('output', 'png')
  renderURL.searchParams.append('background', 'white')
  renderURL.searchParams.append('width', '500')
  renderURL.searchParams.append('source', expr)
  return {
    image: {
      url: renderURL.toString()
    },
    description: `[Open in browser](${renderURL.toString()})`,
    footer: {
      text: 'If the image doesn\'t display, open in browser to check for an error'
    }
  }
}

export const init = (bot: CommandClient): void => {
  bot.registerCommand('latex', async (msg, args) => {
    await msg.channel.createMessage({
      embed: generateEmbed(args.join(' '))
    })
  }, {
    aliases: ['tex'],
    description: 'Render a LaTeX expression',
    usage: 'latex x^2 = 9'
  })

  // Detect inline math mode expressions in message and automatically reply with a render
  bot.on('messageCreate', message => {
    const matches = message.content.matchAll(/(?:^|\s)\$(\S.*?\S)\$(?:\s|$)/g)
    const embeds = Array.from(matches).map(v => generateEmbed(v[1]))
    if (embeds.length > 0) {
      return bot.createMessage(message.channel.id, {
        embeds,
        messageReference: {
          messageID: message.id
        }
      })
    }
  })
}

export default {
  init
}
