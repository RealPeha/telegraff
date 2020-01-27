import { Bot, Scene, Solo } from '../../src'
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
    scenes: [ WelcomeScene ],
})
class BotModule extends Solo {
    static token = process.env.BOT_TOKEN
    static sessions = true

    bindHooks = true;

    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name || ''}`

    @start start = ({ reply }) => reply(`Hello ${this.fullName}! Try /go`)
    @command go = enter('test')
    @on message = 'Я не понимаю тебя' // auto reply if only string as value
}

BotModule.launch()
