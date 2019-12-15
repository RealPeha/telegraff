import { Middleware, ContextMessageUpdate } from 'telegraf';

export interface BotModuleData {
    middlewares?: Array<Middleware<ContextMessageUpdate>> | any;
    scenes?: Array<object>;
    composers?: Array<object>;
}
