import { Bot, Start, Command, UseMiddlewares } from '../../src';

import { LogMiddleware, TestMiddleware} from './middlewares';

const useMiddleware = (ctx, next) => {
    console.log('use middleware')
    next()
}

@Bot({
    middlewares: [ LogMiddleware, TestMiddleware ],
})
export class BotModule {

    @Start()
    async start({ reply }) {
        await reply('Hi')
    }

    @Command('test')
    @UseMiddlewares(useMiddleware)
    test() { }
}
