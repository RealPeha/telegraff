import { session } from 'telegraf'

import { Bot, Scene } from '../../src'
import { command, on } from '../../src/common/property'

@Scene('test')
class WelcomeScene {
    enter = ({ reply }) => reply('Добро пожаловать! Введи /hello или /goodbye')
    leave = ({ reply }) => reply('Пока')
    @command hello = ({ reply }) => reply('Привет!')
    @command goodbye = ctx => ctx.scene.leave()
}

@Bot({
    middlewares: [ session() ],
    scenes: [ WelcomeScene ],
})
export class BotModule {
    start = ctx => ctx.scene.enter('test')
    // or
    // @start blabla = ctx => ctx.scene.enter('test')
    @on message = ({ reply }) => reply('Я не понимаю тебя')
}
