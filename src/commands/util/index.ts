import { CommandClient } from 'eris'

import evaluate from './evaluate'
import kill from './kill'
import status from './status'

export const init = (bot: CommandClient): void => {
  evaluate.init(bot)
  kill.init(bot)
  status.init(bot)
}

export default {
  init
}
