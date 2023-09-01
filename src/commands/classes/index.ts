import { CommandClient } from 'eris'

import management from './management'

export const init = (bot: CommandClient): void => {
  management.init(bot)

  // Redirect to the website for joining classes
  bot.registerCommand(
    'joinclass',
    `Class registration has been moved to ${process.env.FRONTEND_ROOT}. Please use the website to join classes and gain access to their channels.`,
    {
      aliases: ['join'],
      description: `Join classes with ${process.env.FRONTEND_ROOT}`
    }
  )
}

export default {
  init
}
