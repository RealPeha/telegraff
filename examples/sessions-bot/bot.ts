import { Bot, Scene, Launch } from '../../src'
import { command, on, start, hook } from '../../src/common/property'
import { enter, leave } from '../../src/helpers'
import hooks, { bindedHooks } from '../../src/hooks'

@Scene('test')
class WelcomeScene {
    static default = true

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

    disableContext = true

    hook = bindedHooks(this)

    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name || ''}`

    @start start = 'Hello #{fullName}! Try /go' // string template. #{fullName} replaced with hook fullName result
    @command go = enter('test')
    @command template = ({ reply }) => {
        reply('Hello #{fullName}!') // string template. #{fullName} replaced with hook fullName result, reply is a hook from bindedHooks(this)
    }
    @on message = '42'
}

BotModule.launch()
