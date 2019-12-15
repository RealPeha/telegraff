import { BotFactory } from '../../src'
import { BotModule } from './bot.module'

const bot = BotFactory.create(BotModule, process.env.BOT_TOKEN)

bot.launch()
