import Telegraf, { ContextMessageUpdate } from 'telegraf';

import { BotInstance } from './bot-instance';
import { ModuleLoader } from './module-loader';
import { BotContainer } from './bot-container';

export class BotFactory {

    private static container = new BotContainer();
    public static loader = new ModuleLoader(BotFactory.container);

    static create(argToken: string | any, modules?: Array<any> | any): BotInstance {
        // TODO: refactoring

        const argModules = typeof argToken === 'string' ? modules : argToken;
        const arrayModules = !Array.isArray(argModules) ? [argModules] : argModules;

        let token = typeof argToken === 'string' && argToken;
        let options = {};
        arrayModules.forEach(module => {
            if (module.token && typeof module.token === 'string') {
                token = module.token
            }
            if (module.options && typeof module.options === 'object') {
                options = module.options
            }
        })
        const bot: BotInstance = BotInstance.create(token, options);
        this.container.setupBot(bot);

        this.initialize(arrayModules);

        return bot;
    }

    private static initialize(modules: Array<any> | any): void {
        this.loader.loadMiddlewares(modules);
        this.loader.loadComposers(modules);
        this.loader.loadScenes(modules);
        this.loader.loadMetadata(modules);
    }

}
