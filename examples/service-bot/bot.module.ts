import { Bot, Start, On } from '../../src';

import { BotService, LogService } from './bot.service';

@Bot()
export class BotModule {

    constructor(private readonly service: BotService, private readonly logger: LogService) {}

    @Start()
    @On('text')
    start({ reply }) {
        try {
            reply(this.service.sayHello());
        } catch (err) {
            this.logger.error(err)
        }
    }
}
