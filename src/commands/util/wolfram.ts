// https://github.com/theGordHoard/hoardbot/blob/master/src/commands/util/wolfram.ts
// Copyright Katlyn Lorimer, All Rights Reserved
// Used with permission from Katlyn Lorimer

import { CommandClient, Embed } from 'eris'
import { URL } from 'url'
import fetch from 'node-fetch'
import { WolframResponse } from 'wolfram'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('wolfram', async (msg, args) => {
    const url = new URL('http://api.wolframalpha.com/v2/query')
    url.searchParams.append('output', 'json')
    url.searchParams.append('appid', process.env.WOLFRAM_KEY)
    url.searchParams.append('input', args.join(' '))

    const [req] = await Promise.all([
      fetch(url),
      msg.channel.sendTyping()
    ])

    if (req.ok) {
      const { queryresult: data } = await req.json() as WolframResponse
      if (data.error !== false) { // I don't like this but eslint yells at me otherwise
        await msg.channel.createMessage({
          embed: {
            color: 0xec282c,
            description: (data.error as { msg: string }).msg,
            title: 'Hmm, that\'s not right'
          }
        })
        return
      }
      if (!data.success) {
        await msg.channel.createMessage({
          embed: {
            color: 0xec282c,
            description: `Wolfram|Alpha doesn't have any results for that. ${
              data.didyoumeans?.val === undefined ? ' ' : `Did you mean ${data.didyoumeans.val}?`
            }`,
            title: 'Hmm, that\'s not right'
          }
        })
        return
      }
      const embed: Embed = {
        color: 0x31ada9,
        fields: [],
        footer: {
          text: 'Results provided by Wolfram|Alpha'
        },
        type: 'rich'
      }
      for (const pod of data.pods) {
        if (pod.subpods[0] !== undefined) {
          const subpod = pod.subpods[0]
          if (
            subpod.plaintext.length === 0 &&
            embed.image === undefined &&
            subpod.img !== undefined
          ) {
            embed.image = { url: subpod.img.src }
          } else if (subpod.plaintext.length > 0 && subpod.plaintext.length < 1024) {
            embed.fields.push({
              name: pod.title,
              value: subpod.plaintext
            })
          }
        }
        if (embed.fields.length > 4) {
          break
        }
      }
      await msg.channel.createMessage({ embed })
    } else {
      await msg.channel.createMessage({
        embed: {
          color: 0xec282c,
          description: 'We weren\'t able to reach Wolfram|Alpha. Try again in a bit?',
          title: 'Hmm, that\'s not right'
        }
      })
    }
  }, {
    aliases: ['alpha'],
    description: 'Query Wolfram|Alpha.',
    usage: 'utility'
  })
}

export default {
  init
}
