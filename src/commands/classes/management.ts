import { CommandClient, TextChannel, Message } from 'eris'
import { r } from '../../config/redis'
import { RedisClass } from '../../custom'
import { getReply } from '../../config/bot'

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

  bot.registerCommand('merge', async (msg, args) => {
    if (args.length !== 2) {
      await msg.channel.createMessage('Invalid usage.')
      return
    }
    const [to, from] = await Promise.all(args.map(async id => JSON.parse(await r.get(`class:${id}`)) as RedisClass))
    const [toId, fromId] = args
    if (to === null) {
      await msg.channel.createMessage(`Class ${toId} not found`)
      return
    }
    if (from === null) {
      await msg.channel.createMessage(`Class ${fromId} not found`)
      return
    }

    // Make sure that these are the classes that they actually want to merge
    const confirmationText = `${from.subject}-${from.course}-${from.section}>${to.subject}-${to.course}-${to.section}`
    await msg.channel.createMessage(`Are you sure you want to merge ${from.subject}-${from.course}-${from.section} into ${to.subject}-${to.course}-${to.section}?\nReply with \`${confirmationText}\` to confirm.`)
    const confirmation = await getReply(msg.channel, msg.author)

    if (confirmation.content !== confirmationText) {
      await msg.channel.createMessage('Confirmation does not match, not merging classes.')
      return
    }

    const { guild } = msg.channel as TextChannel
    await Promise.all(guild.members.map(async m => {
      if (m.roles.includes(fromId)) {
        await m.addRole(toId, 'Class migration')
      }
    }))
    const classJson = await r.get(`class:${fromId}`)
    const fromClass = JSON.parse(classJson) as RedisClass
    try {
      await Promise.all([
        guild.deleteRole(fromId),
        guild.channels.get(fromClass.channel).delete(),
        r.lrem('class.list', 0, fromId),
        r.del(`class:${fromId}`)
      ])
    } catch {}
    await msg.channel.createMessage('Classes merged.')
  }, {
    description: 'Merge two classes.',
    fullDescription: 'The first class will be the one to stay. The second will have all students moved to the first and will be destroyed.',
    usage: 'to-id from-id',
    requirements: moderatorOptions,
    guildOnly: true
  })

  bot.registerCommand('deleteclass', async (msg, args) => {
    const [classId] = args
    const classMetadata = JSON.parse(await r.get(`class:${classId}`)) as RedisClass
    if (classMetadata === null) {
      await msg.channel.createMessage('Class not found')
      return
    }

    // Make sure they actually want to delete this course
    const confirmationText = `${classMetadata.subject}-${classMetadata.course}-${classMetadata.section}`
    await msg.channel.createMessage(`Are you sure you want to delete ${confirmationText} course? Reply with \`${confirmationText}\``)
    const confirmation = await getReply(msg.channel, msg.author)

    if (confirmation.content !== confirmationText) {
      await msg.channel.createMessage('Confirmation does not match, not deleting course.')
      return
    }

    const { guild } = msg.channel as TextChannel
    try {
      await Promise.all([
        guild.deleteRole(classId),
        guild.channels.get(classMetadata.channel).delete(),
        r.lrem('class.list', 0, classId),
        r.del(`class:${classId}`)
      ])
    } catch {}
    await msg.channel.createMessage('Class deleted.')
  }, {
    description: 'Delete a class',
    requirements: moderatorOptions,
    guildOnly: true
  })
}

export default {
  init
}
