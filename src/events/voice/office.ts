import { CommandClient, Member, VoiceChannel } from 'eris'

function deleteOffice (channel: VoiceChannel): void {
  if (channel.name.endsWith("'s office")) {
    if (channel.voiceMembers.size === 0) {
      channel.delete('No more people in office space').catch(err => console.log(err))
    }
  }
};
export const init = (bot: CommandClient): void => {
  bot.on('voiceChannelJoin', async (member: Member, channel: VoiceChannel) => {
      console.log('asd')
    if (channel.name.startsWith('Join to create an office')) {
      bot.createChannel(channel.guild.id, `${member.nick}'s office`, 2, { parentID: channel.parentID }).catch(err => console.log(err)).then((newChannel: VoiceChannel) => {
        member.edit({ channelID: newChannel.id }).catch(err => console.log(err))
      }).catch(err => console.log(err))
    }
  })
  bot.on('voiceChannelLeave', (member: Member, channel: VoiceChannel) => {
    deleteOffice(channel)
  })
  bot.on('voiceChannelSwitch', (member: VoiceChannel, newChannel: VoiceChannel, oldChannel: VoiceChannel) => {
    deleteOffice(oldChannel)
  })
}

export default {
  init
}
