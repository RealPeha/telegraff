import { session } from 'telegraf'

import { Bot, Scene } from '../../src'
import { command, on, middleware, start } from '../../src/common/property'

@Scene('test')
class WelcomeScene {
    enter = ({ reply }) => reply('Добро пожаловать! Введи /hello или /goodbye')
    leave = ({ reply }) => reply('Пока')
    @command hello = ({ reply }) => reply('Привет!')
    @command goodbye = ({ scene }) => scene.leave()
}

@Bot({
    middlewares: [ session() ],
    scenes: [ WelcomeScene ],
})
export class BotModule {
    @middleware test = (ctx, next) => {
        console.log('test middleware')
        next()
    }
    @start blabla = ({ scene }) => scene.enter('test')
    @on message = ({ reply }) => reply('Я не понимаю тебя')
}
