import { Middleware, ContextMessageUpdate } from 'telegraf';

export interface BotModuleData {
    middlewares?: Array<Middleware<ContextMessageUpdate>> | Middleware<ContextMessageUpdate> | any;
    scenes?: Array<object> | object;
    composers?: Array<object> | object;
}
