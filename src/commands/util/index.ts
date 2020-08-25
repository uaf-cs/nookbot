import { CommandClient } from 'eris'

import kill from './kill'
import status from './status'

export const init = (bot: CommandClient): void => {
  kill.init(bot)
  status.init(bot)
}

export default {
  init
}
