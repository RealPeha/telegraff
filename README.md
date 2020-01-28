## Telegraff
A progressive Node.js framework for building bots using Typescript decorators. Based on [Telegraf](https://github.com/telegraf/telegraf "Telegraf")

### New features in addition to features from Telegraff
- Dependency injection (services)
- Hooks
- Global extra parameter (no more replyWithHTML)

### Installation

```
$ yarn add telegraff
```

### A simple example of a bot on methods
You can see more examples in the folder [examples](https://github.com/RealPeha/telegraff/tree/master/examples "examples")

```javascript
import { session } from 'telegraf';
import { BotFactory } from 'telegraff';
import { Bot, Command, On, UseMiddlewares } from 'telegraff/common';

@Bot({
    middlewares: [ session() ] // глобальные middleware
})
export class BotModule {
    @Start()
    start(ctx) {
        ctx.reply(`Привет <b>${ctx.from.username}</b>`);
    }

    @Command('donate')
    menu(ctx) {
        ctx.reply('Спасибо!')
    }
}
const token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'
const bot = BotFactory.create(BotModule, token)

bot.setGlobalParseMode('HTML') // глобальный parse_mode для reply
bot.launch()
```

### Example bot on properties
```javascript
import { session } from 'telegraf';
import { BotFactory, Bot, hears, command } from 'telegraff';
import { reply } from 'telegraff/helpers';

@Bot()
export class BotModule {
    static token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'

    start = ctx => ctx.reply(`Добро пожаловать <b>${ctx.from.username}</b>!`)
    // или
    // @start blabla = ctx => ctx.reply(`Добро пожаловать <b>${ctx.from.username}</b>!`)
    @command ping = reply('pong')
    @hears 'Hello World' = ({ reply }) => reply('Привет')
}

const bot = BotFactory.create(BotModule)
bot.setGlobalParseMode('HTML')
bot.launch()
```

### Bot creation
To create a bot, use the create method of the BotFactory factory. The bot module takes the first argument, the second optional token. If the token is not specified, then it is taken from the static token property in the module
```javascript
import { Bot, BotFactory } from 'telegraff';

@Bot()
export class BotModule {
    static token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'
}

const bot = BotFactory.create(BotModule)
bot.setGlobalParseMode('HTML')
bot.launch()
```

### Handlers
- declaring handlers class methods using decorators

The name of the decorators matches the name of the handler in Telegraf. For example, processing bot.start () -> Start decorator, etc. by logic
```javascript
import { Start, Hears } from 'telegraff' // or from 'telegraff/common/method'
class BotModule {
    @Start()
    start(ctx) {
        ctx.reply('Добро пожаловать!')
    }

    @Hears('Привет')
    hello({ reply }) {
        reply('Привет')
    }
}
```
- declaring handlers class properties

Handlers that do not require any additional input (start, enter, leave, etc.) can be declared without using a decorator. Similarly, the name of the decorators matches the name of the handler in Telegraf. For example, processing bot.start () -> start decorator, etc. by logic
```javascript
import { start, hears, command } from 'telegraff' // or from 'telegraff/common/property'
class BotModule {
    start = ctx => ctx.reply('Добро пожаловать!')
    // или
    @start somename = ctx => ctx.reply('Добро пожаловать!')

    @hears 'Привет' = ({ reply }) => reply('Привет')
    @command lol = ({ reply }) => reply('42')
}
```
### Hooks
A hook is a function that has access to the current context. To prevent each handler from accessing the long path to the context, you can use the hook to create a set of specific abbreviations.

##### Three ways to declare a hook
- using the @hook decorator
```javascript
class BotModule {
    @hook id = ctx => ctx.from.id
    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name}`
}
```
- declare the hook property as a function that accepts the current context and rotates the object
```javascript
class BotModule {
    hook = ctx = ({
        id: ctx.from.id,
        fullName: `${ctx.from.first_name} ${ctx.from.last_name}`,
    })
}
```
The advantage of this approach is that it is one hook, that is, one call, unlike the first option, where each hook is a separate function

- declare a hook property as a property object which functions return
```javascript
class BotModule {
    hook = {
        id: ctx => ctx.from.id
        fullName: ctx => `${ctx.from.first_name} ${ctx.from.last_name}`
    }
}
```

The use of hooks in all three cases remains the same. You can combine hooks with decorators and properties

##### Three ways to use hooks
- option similar to the first, but with the <b> disableContext </b> option enabled

If you often use hooks, then there may be a situation where you are not using context. And if you enable the disableContext option, the order of the processing arguments changes so that the hooks become the first
```javascript
class BotModule {
    disableContext = true // enable the disableContext option

    @hook username = ctx => ctx.from.username
    @hook reply = (..args) => ctx => ctx.reply(...args) // turns the context method into a hook

    start = ({ reply, username }, ctx) => reply(`Hello ${username}`) // ctx not used - can be removed
    start = (ctx, { reply, username }) => reply(`Hello ${username}`) // so it would be with the disableContext option turned off
}
```
- the result of hooks gets the second argument in all handlers except use - there it is the third
```javascript
class BotModule {
    @hook username = ctx => ctx.from.username

    start = (ctx, hooks) => ctx.reply(`Hello ${hooks.username}`)

    // or use destructuring to make the code shorter and clearer
    @command = ({ reply }, { username }) => reply(`Hello ${username}`)
}
```
- the result of hooks is placed in this of each handler

To do this, enable the <b> bindHooks </b> option
```javascript
class BotModule {
    bindHooks = true // enable option

    @hook username = ctx => ctx.from.username

    start = ({ reply }) => reply(`Hello ${this.username}`) // looks even better
}
```

##### bindHooks
Enabling this option throws hooks as context into each method and they are accessible through this. It’s convenient not to do destructuring hooks every time, especially if you have a lot of them

But there is a problem in the form of loss of the module context in the handler. This means that if you use dependency injection, the service will become unavailable.
```javascript
class BotModule {
    constructor (private readonly testService: TestService) {}

    bindHooks = true
    @hook username = ctx => ctx.from.username

    start = ({ reply }) => {
        reply(`Hello ${this.username}`)
        this.testService.log('user start') // we get an error because the module context is lost and no longer exists this.testService
    }
}
```

But this problem can be easily solved by forwarding the service through a hook
```javascript
class BotModule {
    constructor (private readonly testService: TestService) {}

    bindHooks = true
    @hook username = ctx => ctx.from.username
    @hook testService = () => this.testService

    start = ({ reply }) => {
        reply(`Hello ${this.username}`)
        this.testService.log('user start') // now everything works fine!
    }
}
```

Hooks are a powerful tool that allows not only to throw some data from the context, but also to create reusable functions in different modules, for example
```javascript
const saveUser = () => async ctx => {
    if (ctx.session.user) {
        const savedUser = await db.save(ctx.session.user)
        return { user }
    }
}

class BotModule {
    hook = {
        saveUser, // монтируем внешний хук
        username: ctx => ctx.from.username,
    }

    start = async (ctx, { saveUser, username }) => {
        await saveUser()
        reply(`Hello ${username}`)
    }
}
```

### Inheritance

If some modules have common handlers or you want to use common hooks in them, then you can create a separate class with which you will expand your modules
```javascript
class Hooks {
    @hook username = ctx.from.username

    @command back = ({ scene }) => scene.enter('menu')
}

class BotModule extends Hooks {
    start = async (ctx, { username }) => {
        ctx.reply(`Hello ${username}`)
    }
}
```

### Other examples

These examples are written using method handlers. They can easily be rewritten to property handlers.

#### Creating scenes
```javascript
// welcome-scene.ts
import { Scene, Enter } from 'telegraff'

@Scene('welcome')
export class WelcomeScene {
    static default = false // set the default scene

    @Enter()
    enter({ reply }) {
        reply('Добро пожаловать!')
    }
}

// bot-module.ts
import { Bot, Command, EnterScene, Hears } from 'telewrap';
import { WelcomeScene } from './welcome-scene'

@Bot({
    scenes: [ WelcomeScene ],
})
export class BotModule {
    @Command('hello')
    @EnterScene('welcome')
    hello() {}

    @Hears('Привет')
    hello({ scene }) {
        scene.enter('welcome')
    }
}
```

#### Dependency injection (services)
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
    constructor(private readonly db: DBService) {}

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

#### Automatic reply
```javascript
class BotModule {
    start = 'Hello' // reply('Hello')
}
```

#### Template string
```javascript
class BotModule {
    @hook getText = ({ from }) => `user: ${from.username}` // hook
    
    @command ping = ({ reply }, { getText }) => reply(getText)
    // vs
    @command ping2 = '#{getText}'
}
```
