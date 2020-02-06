export const enter = ({ scene }) => id => scene && scene.enter(id)
export const reenter = ({ scene }) => id => scene && scene.reenter(id)
export const leave = ({ scene }) => () => scene && scene.leave()
export const id = ({ from }) => from && from.id
export const username = ({ from }) => from && from.username
export const text = ({ message }) => message && message.text
export const data = ({ callbackQuery }) => callbackQuery && callbackQuery.data
export const reply = ctx => (...args) => ctx.reply(...args)
export const format = context => ctx => (str, args = context || {}, template = /\#{([0-9a-zA-Z_]+)\}/g) => {
    return str.replace(template, (match, prop, index) => {
        if (str[index - 1] === "{" && str[index + match.length] === "}") {
            return prop
        } else {
            let result;

            if (args.hasOwnProperty(prop)) {
                if (typeof context[prop] === 'function') {
                    result = context[prop](ctx)
                } else {
                    result = context[prop]
                }
            }

            if (result === null || result === undefined) {
                return ''
            }

            return result
        }
    })
}
export const replyWithFormat = (ctx, { format }) => (...args) => {
    return ctx.reply(format(args.shift()), ...args)
}

export const bindedHooks = (context) => {
    return {
        enter,
        reenter,
        leave,
        id,
        username,
        text,
        data,
        format: format(context),
        reply: replyWithFormat,
    }
}

export default {
    enter,
    reenter,
    leave,
    id,
    username,
    text,
    data,
    reply,
}