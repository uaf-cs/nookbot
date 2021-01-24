import { CommandClient } from 'eris'

import voice from './voice'

export const init = (bot: CommandClient): void => {
  voice.init(bot)
}

export default {
  init
}
