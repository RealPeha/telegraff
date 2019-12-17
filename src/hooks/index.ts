export const enter = ctx => scene => ctx.scene && ctx.scene.enter(scene)
export const reenter = ctx => scene => ctx.scene && ctx.scene.reenter(scene)
export const leave = ctx => () => ctx.scene && ctx.scene.leave()
export const id = ctx => ctx.from && ctx.from.id
export const username = ctx => ctx.from && ctx.from.username
export const text = ctx => ctx.message && ctx.message.text
export const callbackData = ctx => ctx.callbackQuery && ctx.callbackQuery.data
export const reply = ctx => (...args) => ctx.reply(...args)

export default {
    enter,
    reenter,
    leave,
    id,
    username,
    text,
    callbackData,
    reply
}
