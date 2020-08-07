import { CommandClient, TextChannel, Message } from 'eris'
import { r } from '../../config/redis'

const moderatorOptions = {
  custom: (msg: Message) => {
    return msg.member.roles.find(r => [
      process.env.CS_TEACHER,
      process.env.CS_ADMIN
    ].includes(r)) !== undefined
  }
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
          permissionOverwrites: [
            {
              // @everyone, allow none, deny read messages.
              id: guild.id,
              type: 'role',
              allow: 0,
              deny: 1024
            },
            {
              // Teachers, allow mention everyone, deny none
              id: process.env.CS_TEACHER,
              type: 'role',
              allow: 131072,
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
              id: role.id,
              type: 'role',
              allow: 1024,
              deny: 0
            }
          ]
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
}

export default {
  init
}
