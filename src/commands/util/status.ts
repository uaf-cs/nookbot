import { CommandClient } from 'eris'
import { totalmem, freemem } from 'os'
import { r } from '../../config/redis'

export const init = (bot: CommandClient): void => {
  bot.registerCommand('status', async msg => {
    const { rss } = process.memoryUsage()
    const formattedRss = Math.round(rss / 1024 / 1024 * 100) / 100
    const formattedTotal = Math.round(totalmem() / 1024 / 1024 / 1024 * 100) / 100
    const formattedMem = Math.round((totalmem() - freemem()) / 1024 / 1024 / 1024 * 100) / 100

    const uptime = process.uptime()
    const days = Math.floor(uptime / (60 * 60 * 24))
    const hours = Math.floor(uptime / (60 * 60)) % 24
    const minutes = Math.floor(uptime / 60) % 60
    const seconds = Math.floor(uptime) % 60

    const classCount = await r.llen('class.list')

    await msg.channel.createMessage({
      embed: {
        title: 'Nookbot Resource Usage',
        timestamp: new Date(),
        fields: [
          {
            name: 'Process Memory',
            value: `${formattedRss} MB`
          },
          {
            name: 'System Memory',
            value: `${formattedMem} GB / ${formattedTotal} GB`
          },
          {
            name: 'Uptime',
            value: `${days}:${hours}:${minutes}:${seconds}`
          },
          {
            name: 'Course count',
            value: classCount.toString()
          }
        ]
      }
    })
  }, {
    description: 'Get various numbers relating to resource usage'
  })
}

export default {
  init
}
