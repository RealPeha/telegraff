import { injector } from '../../injector'
import { Composer as TelegrafCompose } from 'telegraf'
import { BotFactory } from '../../bot-factory'

export const Composer = (): ClassDecorator => {
    return (target: any) => {
        const loader = BotFactory.loader

        const telegrafComposer = new TelegrafCompose();
        const composerModuleInstance = injector.instantiateDependency(target);
        loader.bindHandlers(telegrafComposer, composerModuleInstance)

        return Object.assign(target, {
            get composer() {
                return telegrafComposer;
            }
        })
    }
}
