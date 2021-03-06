import { BotFactory } from '../../src'

import { BotModule } from './bot.module'

const token = process.env.BOT_TOKEN

const bot = BotFactory.create(BotModule, token)

bot.launch()
