import Telegraf from 'telegraf'
import { ExtraReplyMessage, Message } from 'telegraf/typings/telegram-types'

import { globalOptions } from './global-options'

// @ts-ignore
export class CustomContext extends Telegraf.Context {
    extra: ExtraReplyMessage = {}

    constructor (update, telegram, options) {
        super(update, telegram, options)
    }

    reply(text: string, extra: ExtraReplyMessage = {}): Promise<Message> {
        const externalExtra = this.extra || {}
        const extraDefault = {
            parse_mode: globalOptions.parseMode,
        }

        return super.reply(text, {...extraDefault, ...externalExtra, ...extra })
    }
}
