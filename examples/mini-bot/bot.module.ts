import { session } from 'telegraf'
import { Bot, Scene } from '../../src'
import { command, on, start, hook } from '../../src/common/property'
import { enter, leave, reply } from '../../src/helpers'

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

    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name || ''}`

    @start blabla = (ctx, { fullName }) => ctx.reply(`Hello ${fullName}! Try /go`)
    @command go = enter('test')
    @on message = reply('Я не понимаю тебя')
}
