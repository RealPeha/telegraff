export { enter, leave, reenter } from 'telegraf/stage'

export const reply = (...arg) => ctx => ctx.reply(...arg)
