import { BotInstance } from './bot-instance'

export class BotContainer {
    private _bot: BotInstance;

    public setupBot(bot: BotInstance): void {
        this._bot = bot;
    }

    public getBot(): BotInstance {
        return this._bot;
    }

}
