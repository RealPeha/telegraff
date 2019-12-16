import { session } from 'telegraf'
import { Bot, Scene } from '../../src'
import { command, on, start } from '../../src/common/property'
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
    @start blabla = reply('Try /go')
    @command go = enter('test')
    @on message = reply('Я не понимаю тебя')
}
