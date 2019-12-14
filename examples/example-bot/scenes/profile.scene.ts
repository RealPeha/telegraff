import { Scene, Enter, Command, LeaveScene, On, Leave } from '../../../src';

@Scene('profile')
export class ProfileScene {
    @Enter()
    async enter({ reply, session: { user } }) {
        await reply('Это твой профиль')
        await reply(`id: ${user.id}\nusername: ${user.username}`)
        reply('Введи /leave чтобы покинуть профиль')
    }

    @Leave()
    leave({ reply }) {
        reply('Вы покинули профиль')
    }

    @Command('leave')
    @LeaveScene()
    back() {}

    // Пустой обработчик, чтобы заблокировать @On('message') модуля бота в этой сцене
    @On('text')
    text() {}
}
