## Telegraff
A progressive Node.js framework for building bots using Typescript decorators. Based on [Telegraf](https://github.com/telegraf/telegraf "Telegraf")

### Новые функции в дополнении к функциям из Telegraff
- Внедрение зависимостей (сервисы)
- Хуки
- Глобальный extra параметр (больше никаких replyWithHTML)

### Установка

```
$ yarn add telegraff
```

### Простой пример бота на методах
Больше примеров Вы можете увидеть в папке [examples](https://github.com/RealPeha/telegraff/tree/master/examples "examples")

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

### Пример бота на свойствах
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

### Создание бота
Для создания бота используется метод create фабрики BotFactory. Первым аргументом принимает модуль бота, вторым необязательным токен. Если токен не указан, то он берется из статического свойства token в модуле
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

### Обработчики
- объявление обработчиков методами класса с применением декораторов
Название декораторов совпадает с названием обработчика в Telegraf. Например обработчкик bot.start() -> декоратор Start и т.д. по логике
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
- объявление обработчиков свойствами класса
Обработчика которые не требуют никаких дополнительных входных данных (start, enter, leave и т.д.) могут объявлятся без использования декоратора. Аналогично название декораторов совпадает с названием обработчика в Telegraf. Например обработчкик bot.start() -> декоратор start и т.д. по логике
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
### Хуки
Хук - это функция, которая имеет доступ к текущему контекту. Чтобы в каждом обработчике не обращаться по длинному путю в контекст, с помощью хука вы можете создать набор определенных сокращений.

##### Три способа объявления хука
- с помощью декоратора @hook
```javascript
class BotModule {
    @hook id = ctx => ctx.from.id
    @hook fullName = ctx => `${ctx.from.first_name} ${ctx.from.last_name}`
}
```
- объявить свойство hook как функцию принимающею текущий контекст и вовращающую объект
```javascript
class BotModule {
    hook = ctx = ({
        id: ctx.from.id,
        fullName: `${ctx.from.first_name} ${ctx.from.last_name}`,
    })
}
Преимущество этого подхода в том, что это один хук, т.е. один вызов в отличии от первого вариант где каждых хук это отдельная функция
```
- объявить свойство hook как объект свойства которого возвращаюют функции
```javascript
class BotModule {
    hook = {
        id: ctx => ctx.from.id
        fullName: ctx => `${ctx.from.first_name} ${ctx.from.last_name}`
    }
}
```

Использование хуков во всех трех вариантах остается одинаковым. Можно совмещать хуки декораторами и свойствами

##### Три способа использования хуков
- вариант похожий на первый, но с включенной опцией <b>disableContext</b>
Если вы часто используете хуки, то может быть ситуация, когда вы не используете контекст. И если вы включите опцию disableContext, то порядок аргументов обработчкив меняется так, что хуки стают первыми
```javascript
class BotModule {
    disableContext = true // включаем опцию disableContext

    @hook username = ctx => ctx.from.username
    @hook reply = (..args) => ctx => ctx.reply(...args) // превращает метод контекста в хук

    start = ({ reply, username }, ctx) => reply(`Hello ${username}`) // ctx не используется - можно убрать
    start = (ctx, { reply, username }) => reply(`Hello ${username}`) // так было бы с выключенной опцией disableContext
}
```
- результат хуков попадает вторым аргументом во всех обработчиках кроме use - там он третьим
```javascript
class BotModule {
    @hook username = ctx => ctx.from.username

    start = (ctx, hooks) => ctx.reply(`Hello ${hooks.username}`)

    // или используйте декструктуризацию чтобы сделать код короче и понятней
    @command = ({ reply }, { username }) => reply(`Hello ${username}`)
}
```
- результат хуков помещается в this каждого обработчика
Для этого необходимо включить опцию <b>bindHooks</b>
```javascript
class BotModule {
    bindHooks = true // включаем опцию

    @hook username = ctx => ctx.from.username

    start = ({ reply }) => reply(`Hello ${this.username}`) // выглядит еще лучше
}
```

##### bindHooks
Включение этой опции пробрасывает хуки как контекст в каждый метод и они доступны через this. Это удобно, чтобы не делать каждый раз декструктуризацию хуков особенно если их у вас много
Но появляется проблема в виде потери контекст модуля в обработчике. Это значит что если вы используете внедрение зависимостей, то сервис станет недоступым.
```javascript
class BotModule {
    constructor (private readonly testService: TestService) {}

    bindHooks = true
    @hook username = ctx => ctx.from.username

    start = ({ reply }) => {
        reply(`Hello ${this.username}`)
        this.testService.log('user start') // получим ошибку т.к. теряется контекст модуля и больше не существует this.testService
    }
}
```
Но эту проблему можно легко лешить путем проброса сервиса через хук
```javascript
class BotModule {
    constructor (private readonly testService: TestService) {}

    bindHooks = true
    @hook username = ctx => ctx.from.username
    @hook testService = () => this.testService

    start = ({ reply }) => {
        reply(`Hello ${this.username}`)
        this.testService.log('user start') // теперь всё работает отлично!
    }
}
```

Хуки мощный инструмент позволяющий не только прокидывать какие-то данные из контекста, но и создавать переиспользуемые функции в разных модулях, например
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

### Наследование

Если некоторые модули имеют общие обработчики или вы хотите использовать в них общие хуки, то вы можете создать отдельный класс, которым вы будете расширять ваши модули
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

### Другие примеры
Эти примеры написаны с использованием обработчиков на методах. Они легко могут быть переписаны на обработчики на свойствах
#### Создание сцен
```javascript
// welcome-scene.ts
import { Scene, Enter } from 'telegraff'

@Scene('welcome')
export class WelcomeScene {
    static default = false // устанавливание сцену по умолчанию

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

#### Внедрение зависимостей (сервисы)
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

#### Устанавливаем глобальный parse_mode
```javascript
const bot = BotFactory.create(BotModule, token)
bot.setGlobalParseMode('HTML')
bot.launch()
```
