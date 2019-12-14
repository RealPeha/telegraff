import { Markup } from 'telegraf'
import { Bot, Command, On, EnterScene, Action, Catch, Extra } from '../../src';

import { ProfileScene } from './scenes';
import { Session, Reg } from './middlewares';

@Bot({
    middlewares: [ Session, Reg ],
    scenes: [ ProfileScene ],
})
export class BotModule {
    static token = process.env.BOT_TOKEN
    static options = {}

    @Command('profile')
    @EnterScene('profile')
    profile() {}

    @Command('error')
    error() {
        throw new Error('500')
    }

    @On('message')
    @Extra({
        parse_mode: 'Markdown',
    })
    async message(ctx) {
        await ctx.reply(`Привет <i>${ctx.session.user.username}</i>!`)
        await ctx.reply(`Введи /profile или ***нажми*** на кнопку`, Markup.inlineKeyboard([
            Markup.callbackButton('Открыть профиль', 'open-profile'),
        ]).extra())
    }

    @Action('open-profile')
    async callbackQuery({ reply, session: { user } }) {
        await reply('<i>Это твой профиль</i>')
        await reply(`id: ${user.id}\nusername: ${user.username}`)
    }

    @Catch()
    catch(err, { reply }) {
        console.log(err)
        reply(`<b>Произошла ошибка:</b><i> ${err.toString()}</i>`)
    }
}
