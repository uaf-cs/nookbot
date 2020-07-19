import { CommandClient } from 'eris'

import facts from './facts'
import images from './images'
import roll from './roll'

export const init = (bot: CommandClient): void => {
  facts.init(bot)
  images.init(bot)
  roll.init(bot)
}

export default {
  init
}
