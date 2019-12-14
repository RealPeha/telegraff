## Telegraff
Telegraff - this is a framework for creating bots using decorators in a style similar to Angular. Based on [Telegraf](https://github.com/telegraf/telegraf "Telegraf")

### Implemented from Telegraf and features
- Dependency injection
- Services
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
    static token = '283850275:AAE2ijl1gsSpidVCxTTaeAz_7i9Jt71wY88'

    @Start()
    start({ reply, from }) {
        reply(`Hello <b>${from.username}</b>`);
    }
}
const bot = BotFactory.create(BotModule)
bot.setGlobalParseMode('HTML') // set global parse mode
bot.launch()
```

### Base examples
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
const bot = BotFactory.create(token, BotModule)
bot.setGlobalParseMode('HTML')
bot.launch()
```
