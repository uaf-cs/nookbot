import { CommandClient } from 'eris'
import { URL } from 'url'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('latex', async (msg, args) => {
    const renderURL = new URL('https://math.katlyn.dev/render')
    renderURL.searchParams.append('input', 'latex')
    renderURL.searchParams.append('output', 'png')
    renderURL.searchParams.append('background', 'white')
    renderURL.searchParams.append('width', '500')
    renderURL.searchParams.append('source', args.join(' '))
    await msg.channel.createMessage({
      embed: {
        image: {
          url: renderURL.toString()
        },
        description: `[Open in browser](${renderURL.toString()})`,
        footer: {
          text: 'If the image doesn\'t display, open in browser to check for an error'
        }
      }
    })
  }, {
    aliases: ['tex'],
    description: 'Render a LaTeX expression',
    usage: 'latex x^2 = 9'
  })
}

export default {
  init
}
