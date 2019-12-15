import { BotInstance } from './bot-instance';
import { ModuleLoader } from './module-loader';
import { BotContainer } from './bot-container';

export class BotFactory {

    private static container = new BotContainer();
    public static loader = new ModuleLoader(BotFactory.container);

    static create(module: any, token?: string, options?: any): BotInstance {
        const bot: BotInstance = BotInstance.create(token || module.token, options || module.options || {});
        this.container.setupBot(bot);

        this.initialize(module);

        return bot;
    }

    private static initialize(module: any): void {
        this.loader.loadMiddlewares(module);
        this.loader.loadComposers(module);
        this.loader.loadScenes(module);
        this.loader.loadMetadata(module);
    }

}
