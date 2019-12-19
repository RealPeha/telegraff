import { session } from 'telegraf'
import { Bot, Scene, Injectable } from '../../src'
import { command, on, start, hook } from '../../src/common/property'
import { enter, leave, reply } from '../../src/helpers'
import hooks from '../../src/hooks'

@Scene('test')
class WelcomeScene {
    enter = reply('Добро пожаловать! Введи /hello или /goodbye')
    leave = reply('Пока')
    @command hello = reply('Привет!')
    @command goodbye = leave()
}

@Bot({
    middlewares: [ session() ],
    scenes: [ WelcomeScene ],
})
export class BotModule {
    static token = process.env.BOT_TOKEN

    disableContext = true // For hook only style. move context to second argument, hooks are now on the first
    bindHooks = true // bind hooks result as context to all handlers, now available from this
    hook = hooks // connect a set of built-in hooks, we will use reply hook

    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name || ''}`

    @start start = ({ reply, fullName }) => {
        console.log(this)
        reply(`Hello ${fullName}! Try /go`)
    }
    @command go = enter('test')
    @on message = reply('Я не понимаю тебя')
}
