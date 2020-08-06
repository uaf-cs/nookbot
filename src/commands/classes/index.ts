import { CommandClient } from 'eris'

import management from './management'

export const init = (bot: CommandClient): void => {
  management.init(bot)
}

export default {
  init
}
