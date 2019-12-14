import Telegraf, { ContextMessageUpdate, TelegrafOptions, LaunchPollingOptions, LaunchWebhookOptions } from 'telegraf'
import { ParseMode } from 'telegraf/typings/telegram-types'

import { CustomContext } from './bot-context'
import { globalOptions } from './global-options'

export class BotInstance {
    instance: Telegraf<ContextMessageUpdate>;

    constructor(token: string, options: object = {}) {
        this.instance = new Telegraf(token, options)
    }

    static create(token: string, options: object = {}): BotInstance {
        const defaultOptions = {
            contextType: CustomContext,
        }

        const bot = new BotInstance(token, { ...defaultOptions, ...options })

        return bot
    }

    launch(options: {
        polling?: LaunchPollingOptions,
        webhook?: LaunchWebhookOptions,
    } = {}): Promise<void> {
        return this.instance.launch(options)
    }

    setGlobalParseMode(parseMode: ParseMode) {
        globalOptions.parseMode = parseMode
        return this
    }
}