import { CommandClient, TextChannel, Message, PermissionOverwrite, CreateChannelOptions } from 'eris'
import { r } from '../../config/redis'

const moderatorOptions = {
  custom: (msg: Message) => {
    return msg.member.roles.find(r => [
      process.env.CS_TEACHER,
      process.env.CS_ADMIN
    ].includes(r)) !== undefined
  }
}

const generateOverwrites = (role: string): Array<{
  id: string
  type: 'role'|'member'
  allow: number
  deny: number
}> => {
  return [
    {
      // @everyone, allow none, deny read messages.
      id: process.env.CS_GUILD,
      type: 'role',
      allow: 0,
      deny: 1024
    },
    {
      // Teachers, allow mention everyone and manage messages, deny none
      id: process.env.CS_TEACHER,
      type: 'role',
      allow: 139264,
      deny: 0
    },
    // {
    //   // Muted, allow none, deny send messages
    //   id: process.env.CS_MUTED,
    //   type: 'role',
    //   allow: 0,
    //   deny: 2048
    // },
    {
      // Class role, allow read messages, deny none
      id: role,
      type: 'role',
      allow: 1024,
      deny: 0
    }
  ]
}

export const init = (bot: CommandClient): void => {
  bot.registerCommand('addclasses', async (msg, [parent]) => {
    const { guild } = msg.channel as TextChannel
    if (guild.channels.get(parent) === undefined) {
      await msg.channel.createMessage('Please provide a valid parent category ID')
      return
    }
    await msg.channel.sendTyping()
    const response: string[] = []
    const [,...courseList] = msg.content.split('\n')
    for (const c of courseList) {
      const [
        subject,
        course,
        section,
        title,
        instructor,
        enrolment,
        sessionCode
      ] = c.split(',')
      const role = await guild.createRole({
        name: `${subject}${course} - ${section} ${instructor}`,
        permissions: 0
      })
      const channel = await guild.createChannel(
        `${subject}${course}-${section}`,
        0,
        {
          parentID: parent,
          permissionOverwrites: generateOverwrites(role.id)
        }
      )
      await r.lpush('class.list', role.id)
      await r.set(`class:${role.id}`, JSON.stringify({
        channel: channel.id,
        subject,
        course,
        section,
        title,
        instructor,
        enrolment,
        sessionCode
      }))
      response.push(`Added ${role.mention}`)
    }
    await msg.channel.createMessage(response.join('\n'))
  }, {
    description: 'Add classes in bulk from a CSV file',
    requirements: moderatorOptions,
    guildOnly: true
  })

  bot.registerCommand('sync', async msg => {
    const typing = msg.channel.sendTyping()
    const classes = await r.lrange('class.list', 0, -1)
    const { guild } = msg.channel as TextChannel
    const classPromises = classes.map(async c => {
      const classJson = await r.get(`class:${c}`)
      const classChannelId = JSON.parse(classJson).channel as string
      const classChannel = guild.channels.get(classChannelId)
      if (classChannel !== undefined) {
        const overwrites = generateOverwrites(c)
        for (const ow of overwrites) {
          await classChannel.editPermission(ow.id, ow.allow, ow.deny, ow.type, 'Syncing class channels')
        }
      }
    })
    await Promise.all([typing, ...classPromises])
    await msg.channel.createMessage('Done')
  }, {
    description: 'Sync class channel permissions to the latest defined in the source.',
    requirements: moderatorOptions,
    guildOnly: true
  })
}

export default {
  init
}
