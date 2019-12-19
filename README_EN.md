## Telegraff
Telegraff - this is a framework for creating bots using decorators in a style similar to Angular. Based on [Telegraf](https://github.com/telegraf/telegraf "Telegraf")

### Implemented from Telegraf and features
- Dependency injection
- Services
- Hooks
- Global extra parameters
- Scenes
- Wizard scenes

### Installation

```
$ yarn add telegraff
```

### Simple example bot
You can find more cool examples in the [examples](https://github.com/RealPeha/telegraff/tree/master/examples "examples") folder

```javascript
import { session } from 'telegraf';
import { BotFactory } from 'telegraff';
import { Bot, Command, On, UseMiddlewares } from 'telegraff/common';

@Bot({
    middlewares: [ session() ] // register global middleware
})
export class BotModule {
    @Start()
    start({ reply, from }) {
        reply(`Hello <b>${from.username}</b>`);
    }
}
const token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'
const bot = BotFactory.create(BotModule, token)
bot.setGlobalParseMode('HTML') // set global parse mode
bot.launch()
```

### Very simple example bot
```javascript
import { session } from 'telegraf';
import { BotFactory, Bot, hears, command } from 'telegraff';
import { reply } from 'telegraff/helpers';

@Bot()
export class BotModule {
    static token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'

    start = ({ reply, from }) => reply(`Hello <b>${from.username}</b>`)
    // or
    // @start blabla = ({ reply, from }) => reply(`Hello <b>${from.username}</b>`)
    @command ping = reply('pong')
    @hears 'Hello World' = () => console.log('hello')
}
const bot = BotFactory.create(BotModule)
bot.setGlobalParseMode('HTML') // set global parse mode
bot.launch()
```

### Base examples
#### Hooks
A hook is a function that has access to the current context.
```javascript
import { session } from 'telegraf'
import { Bot } from '../../src'
import { command, on, start, hook } from '../../src/common/property'

@Bot({
	middlewares: [ session() ],
})
export class BotModule {
    static token = 'telegram_bot_token_here'

    @hook id = ctx => ctx.from.id // hook as const value
    @hook reply = ctx => (...args) => ctx.reply(args) // hook as function
    @hook increase = ctx => (value = 1) => ctx.session.count += value

    // all hooks are available as an object, the second argument is all handlers
    start = (ctx, { id, reply }) => {
        reply(`Your id: ${id}`) // use hook reply and id
        ctx.session.count = 0
    }
    @command add = (ctx, { increase, reply }) => {
        increase()
        reply(`Amount: ${ctx.session.count}`)
    }
}
```
If the names of the hooks conflict with the names of the handlers, you can declare them in the hooks property
```javascript
export class BotModule {
    static token = 'telegram_bot_token_here'

    hooks = {
        id: ctx => ctx.from.id
        reply: ctx => (...args) => ctx.reply(args)
    }

    // and use them like normal
    start = (ctx, { id, reply }) => {}
}
```
In the same way you can connect a set of built-in hooks
```javascript
import hooks from 'telegraff/hooks'

export class BotModule {
    static token = 'telegram_bot_token_here'

    hooks = hooks
    // or
    hooks = {
        ...hooks,
        myHook: ctx => ctx.session.jopa
    }

    // and use them like normal
    start = (ctx, { id, reply, myHook }) => {}
}
```
#### Create scenes
```javascript
// welcome-scene.ts
import { Scene, Enter } from 'telegraff'

@Scene('welcome')
export class WelcomeScene {
    static default = false // true by default, optional, set initial scene

    @Enter()
    enter({ reply }) {
        reply('Добро пожаловать!')
    }
}

// bot-module.ts
import { Bot, Command, EnterScene, Hears } from 'telewrap';
import { WelcomeScene } from './welcome-scene'

@Bot({
    scenes: [ WelcomeScene ], // register scene
})
export class BotModule {
    @Command('hello')
    @EnterScene('welcome') // enter the scene
    hello() {} // ignored, must be empty

    @Hears('Привет')
    hello({ scene }) {
        scene.enter('welcome') // classic way to enter the scene
    }
}
```

#### Dependency injection (Services)
```javascript
// db-service.ts
import { Injectable, Enter } from 'telegraff'

@Injectable()
export class DBService {
    private memoryDB = {}

    find(prop) {
	    return this.memoryDB[prop] || ''
    }
    save(prop, value) {
	    this.memoryDB[prop] = value
    }
}

// bot-module.ts
import { Bot, Start } from 'telegraff';
import { DBService } from './db-service'

@Bot()
export class BotModule {
    constructor(private readonly db: DBService) {} // this.db is a DBService instance

    @Start()
    async start({ reply, from }) {
        const user = this.db.find(from.id)
        if (user) {
            await reply(`Привет ${user}`)
        } else {
            this.db.save(from.id, from.username)
            await reply(`С возвращением ${from.username}!`)
        }
    }
}
```

#### Set global parse_mode
```javascript
const bot = BotFactory.create(BotModule, token)
bot.setGlobalParseMode('HTML')
bot.launch()
```
