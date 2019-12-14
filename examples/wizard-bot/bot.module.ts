import { Markup, session } from 'telegraf'
import { Bot, EnterScene, Composer, WizardScene, Action, Command, Use, On, UseComposer, UseMiddlewares, Leave, Extra } from '../../src';

@Composer()
class StepHandler {
    @Action('next')
    next1(ctx) {
        ctx.reply('Step 2. Via inline button')
        return ctx.wizard.next()
    }

    @Command('next')
    next2(ctx) {
        ctx.reply('Step 2. Via command')
        return ctx.wizard.next()
    }

    @Use()
    use(ctx) {
        ctx.replyWithMarkdown('Press `Next` button or type /next')
    }
}

@WizardScene('super-wizard')
class SuperWizard {
    static default = true

    step1(ctx) {
        // @ts-ignore
        ctx.reply('Step 1', Markup.inlineKeyboard([
            Markup.urlButton('❤️', 'http://telegraf.js.org'),
            Markup.callbackButton('➡️ Next', 'next')
        ]).extra())
        return ctx.wizard.next()
    }

    @UseComposer(StepHandler)
    step_two() {}

    nextStep(ctx) {
        ctx.reply('Step 3')
        return ctx.wizard.next()
    }

    step_4(ctx) {
        ctx.reply('Step 4')
        return ctx.wizard.next()
    }

    last_step(ctx) {
        ctx.reply('Done')
        return ctx.scene.leave()
    }
}

@Bot({
    middlewares: [ session() ],
    scenes: [ SuperWizard ],
})
export class BotModule {}
