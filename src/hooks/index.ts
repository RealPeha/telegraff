export const enter = ({ scene }) => id => scene && scene.enter(id)
export const reenter = ({ scene }) => id => scene && scene.reenter(id)
export const leave = ({ scene }) => () => scene && scene.leave()
export const id = ({ from }) => from && from.id
export const username = ({ from }) => from && from.username
export const text = ({ message }) => message && message.text
export const data = ({ callbackQuery }) => callbackQuery && callbackQuery.data
export const reply = ctx => (...args) => ctx.reply(...args)

export default {
    enter,
    reenter,
    leave,
    id,
    username,
    text,
    data,
    reply
}
