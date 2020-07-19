import { CommandClient } from 'eris'

import fun from './fun'

export const init = (bot: CommandClient): void => {
  fun.init(bot)
}

export default {
  init
}
