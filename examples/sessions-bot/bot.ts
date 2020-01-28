import { Bot, Scene, Launch } from '../../src'
import { command, on, start, hook } from '../../src/common/property'
import { enter, leave } from '../../src/helpers'

@Scene('test')
class WelcomeScene {
    enter = 'Добро пожаловать! Введи /hello или /goodbye'
    leave = 'Пока'
    @command hello = 'Привет!'
    @command goodbye = leave()
}

@Bot({
    scenes: [ WelcomeScene ],
})
class BotModule extends Launch {
    static token = process.env.BOT_TOKEN
    static sessions = true

    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name || ''}`

    @start start = 'Hello #{fullName}! Try /go' // string template. #{fullName} replaced with hook fullName result
    @command go = enter('test')
    @on message = '42'
}

BotModule.launch()
