import { CommandClient } from 'eris'

import evaluate from './evaluate'
import kill from './kill'
import latex from './latex'
import status from './status'
import poll from  './poll'

export const init = (bot: CommandClient): void => {
  evaluate.init(bot)
  kill.init(bot)
  latex.init(bot)
  status.init(bot)
  poll.init(bot)
}

export default {
  init
}
