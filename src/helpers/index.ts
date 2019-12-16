export { enter, leave, reenter } from 'telegraf/stage'

export const reply = (...args) => (ctx) => ctx.reply(...args)
