import { BotFactory } from '../../src'
import { BotModule } from './bot.module'

const bot = BotFactory.create(BotModule)

bot.launch()
