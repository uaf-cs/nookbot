// Requires the Eris NPM package
// JS doesn't support reading BigInts out of JSON foles, so before this is run
// it is required to change ID snowflakes in config.json to strings.

const { Client } = require('eris')
const readline = require('readline')

const { api_token, server_id, class_category_id, teacher_role, muted_role } = require('./config.json')

const bot = new Client(api_token)

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
})

const question = prompt => new Promise(res => {
  rl.question(prompt, ans => {
    rl.close()
    res(ans)
  })
})

bot.on('ready', async () => {
  console.log(`Connected as ${bot.user.username}#${bot.user.discriminator}`)
  const guild = bot.guilds.get(server_id)
  if (guild === undefined) {
    console.error(`Unable to find guild ${server_id}`)
    process.exit()
    return
  }

  const toRecreate = guild.channels.map(c => c).filter(c => c.parentID === class_category_id && c.type === 0)

  const shouldContinue = await new Promise(res => {
    rl.question(
      `Semester rollover will recreate the following channels and respective roles in ${guild.name}:\n${
        toRecreate.map(c => `#${c.name}`).join('\n')
      }\n\nContinue? (yes/no)`,
      ans => {
        rl.close()
        res(ans === 'yes')
      }
    )
  })
  if (!shouldContinue) {
    console.log(`User aborted, shutting down...`)
    process.exit()
    return
  }

  console.log('Removing class roles...')
  const roleProms = guild.roles.map(r => {
    if (r.name.startsWith('class-')) {
      return r.delete('Semester rollover')
    }
  })
  await Promise.all(roleProms)
  console.log('Class roles deleted.')

  console.log('Recreating channels and respective roles...')
  for (const channel of toRecreate) {
    const classRole = await guild.createRole({
      name: `class-${channel.name}`,
      permissions: 0
    }, 'Semester rollover')

    const permissionOverwrites = [
      {
        // @everyone, allow none, deny read messages.
        id: guild.id,
        type: 'role',
        allow: 0,
        deny: 1024
      },
      {
        // Teachers, allow mention everyone, deny none
        id: teacher_role,
        type: 'role',
        allow: 131072,
        deny: 0
      },
      {
        // Muted, allow none, deny send messages
        id: muted_role,
        type: 'role',
        allow: 0,
        deny: 2048
      },
      {
        // Class role, allow read messages, deny none
        id: classRole.id,
        type: 'role',
        allow: 1024,
        deny: 0
      }
    ]

    await guild.createChannel(channel.name, 0, {
      parentID: channel.parentID,
      permissionOverwrites
    }, 'Semester rollover')

    await channel.delete()
  }
  console.log('Rollover complete.')
  process.exit()
})

bot.connect()
