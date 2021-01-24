import { CommandClient } from 'eris'

import office from './office'

export const init = (bot: CommandClient): void => {
  office.init(bot)
}

export default {
  init
}
