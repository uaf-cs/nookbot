import { CommandClient } from 'eris'

import classes from './classes'
import fun from './fun'
import util from './util'

export const init = (bot: CommandClient): void => {
  classes.init(bot)
  fun.init(bot)
  util.init(bot)
}

export default {
  init
}
