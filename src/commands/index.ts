import { CommandClient } from 'eris'

import classes from './classes'
import fun from './fun'

export const init = (bot: CommandClient): void => {
  classes.init(bot)
  fun.init(bot)
}

export default {
  init
}