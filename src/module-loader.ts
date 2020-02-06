import { BaseScene, Stage, Middleware, ContextMessageUpdate, SceneContextMessageUpdate, Composer, session } from 'telegraf';
import * as WizardScene from 'telegraf/scenes/wizard'

import { BotContainer } from './bot-container';
import { Metadata, bindArrow as bind } from './utils';
import * as C from './constants';
import { injector } from './injector';
import { BotInstance } from './bot-instance';
import { format } from './hooks';

export class ModuleLoader {
    constructor(private readonly container: BotContainer) {}

    loadMiddlewares(module: any): void {
        const bot: BotInstance = this.container.getBot();

        if (module.sessions) {

            const userProps = typeof module.sessions === 'object' ? module.sessions : {};
            const sessionProps = {
                property: 'session',
                store: new Map(),
                getSessionKey: (ctx) => ctx.from && ctx.chat && `${ctx.from.id}:${ctx.chat.id}`,
                ...userProps,
            }
            bot.instance.use(session(sessionProps));
        }

        const moduleMiddlewares: Middleware<ContextMessageUpdate>[] = Metadata.get(C.BOT_DATA, module.prototype).middlewares;
        if (moduleMiddlewares && Array.isArray(moduleMiddlewares)) {
            moduleMiddlewares.forEach((middleware: Middleware<ContextMessageUpdate>) => {
                bot.instance.use(middleware);
            })
        }
    }

    loadScenes(module: any): void {
        const bot: BotInstance = this.container.getBot();

        const moduleScenes = Metadata.get(C.BOT_DATA, module.prototype).scenes;
        if (moduleScenes) {
            let defaultScene; // shit
            let stageOptions = {}; // shit

            const scenes = moduleScenes.map(moduleScene => {
                if (Metadata.get(C.WIZARD_SCENE, moduleScene.prototype)) {
                    const sceneName: string = Metadata.get(C.WIZARD_SCENE, moduleScene.prototype)
                    defaultScene = moduleScene.default && sceneName // shit
                    moduleScene.stageOptions && (stageOptions = moduleScene.stageOptions) // shit
                    const methodsName = Object.getOwnPropertyNames(moduleScene.prototype).filter(name => name !== 'constructor')
                    const methods = methodsName.map(name => moduleScene.prototype[name])

                    const scene: BaseScene<SceneContextMessageUpdate> = new WizardScene(sceneName, ...methods)
                    return scene
                } else {
                    const sceneName: string = Metadata.get(C.SCENE, moduleScene.prototype)
                    const sceneOptions = moduleScene.options || {}

                    defaultScene = moduleScene.default && sceneName // shit
                    moduleScene.stageOptions && (stageOptions = moduleScene.stageOptions) // shit

                    const scene: BaseScene<SceneContextMessageUpdate> = new BaseScene(sceneName, sceneOptions)
                    this.loadSceneMetadata(scene, moduleScene)
                    return scene
                }
            })

            const stage = new Stage(scenes, {
                default: defaultScene,
                ...stageOptions,
            });

            bot.instance.use(stage.middleware());
        }
    }

    loadComposers(module: any): void {
        const bot: BotInstance = this.container.getBot();

        const moduleComposers = Metadata.get(C.BOT_DATA, module.prototype).composers;
        if (moduleComposers) {
            moduleComposers.forEach(composerModule => {
                const composer: Composer<SceneContextMessageUpdate> = new Composer();
                this.loadComposerMetadata(composer, composerModule)

                bot.instance.use(composer.middleware());
            })
        }
    }

    loadMetadata(module: any): void {
        const bot: any = this.container.getBot();

        const instanceModule = injector.instantiateDependency(module);
        this.bindHandlers(bot.instance, instanceModule)
    }

    loadSceneMetadata(scene: any, sceneModule) {
        const sceneModuleInstance = injector.instantiateDependency(sceneModule);
        this.bindHandlers(scene, sceneModuleInstance)
    }

    loadComposerMetadata(composer: any, composerModule) {
        const composerModuleInstance = injector.instantiateDependency(composerModule);
        this.bindHandlers(composer, composerModuleInstance)
    }

    bindHandlers(entity, instance) {
        const prototype = Object.getPrototypeOf(instance)

        const methodHandlers = Metadata.get(C.METHOD_HANDLER, prototype) || []
        const propertyHandlers = Metadata.get(C.PROPERTY_HANDLER, prototype) || []

        const disableContext = instance.disableContext || false
        const bindHooks = instance.bindHooks || false

        const functionHook = instance.hook
        const userHooks = Metadata.get(C.HOOK, prototype) || []

        const hooks = functionHook
            ? typeof functionHook === 'object'
                ? [ ...Object.entries(functionHook), ...userHooks ]
                : [ functionHook, ...userHooks ]
            : [ ...userHooks ]

        const valueHandlers = Object.getOwnPropertyNames(instance)
            .filter(handler => !propertyHandlers.some(property => handler === property.property))

        const callHooks = (ctx) => {
            return hooks.reduce((prevHookResult: object, hook: string | [string, (arg1: any, arg2: object) => void] | Function) => {
                try {
                    if (Array.isArray(hook)) {
                        if (typeof hook[1] !== 'function') {
                            throw {error: new Error(`Hook [${hook[0]}] must be a function`)}
                        }
                        return {
                            ...prevHookResult,
                            [hook[0]]: hook[1](ctx, prevHookResult),
                        }
                    }
                    if (typeof hook === 'function') {
                        return {
                            ...prevHookResult,
                            ...hook(ctx, prevHookResult),
                        }
                    }
                    if (typeof instance[hook] !== 'function') {
                        throw {error: new Error(`Hook [${hook}] must be a function`)}
                    }
                    return {
                        ...prevHookResult,
                        [hook]: instance[hook](ctx, prevHookResult),
                    }
                }
                catch(err) {
                    if (err.error) {
                        console.log(err.error)
                    }

                    return prevHookResult
                }
            }, {})
        }

        const callWithBindHook = (ctx, next, handle, type) => {
            const hooksResult = callHooks(ctx)

            try {
                if (type === 'use') {
                    return disableContext
                        ? bindHooks ? bind(handle, hooksResult, ctx, next).call(hooksResult) : handle(hooksResult, ctx, next)
                        : bindHooks ? bind(handle, ctx, next, hooksResult).call(hooksResult) : handle(ctx, next, hooksResult)
                }
                return disableContext
                    ? bindHooks ? bind(handle, hooksResult, ctx, next).call(hooksResult) : handle(hooksResult, ctx, next)
                    : bindHooks ? bind(handle, ctx, hooksResult).call(hooksResult) : handle(ctx, hooksResult)
            } catch {
                // if use helper
                return handle(ctx, next, hooksResult)
            }
        }

        const callMethod = (ctx, next, handle, type) => {
            const hooksResult = callHooks(ctx)

            if (type === 'use') {
                return disableContext
                    ? handle(hooksResult, ctx, next)
                    : handle(ctx, next, hooksResult)
            }
            return disableContext
                ? handle(hooksResult, ctx)
                : handle(ctx, hooksResult)
        }

        valueHandlers.forEach(handler => {
            if (typeof entity[handler] === 'function' && typeof instance[handler] === 'function') {
                entity[handler]((ctx, next) => callWithBindHook(ctx, next, instance[handler], handler))
            }
        })

        propertyHandlers.forEach(handler => {
            if (typeof entity[handler.type] === 'function') {
                if (typeof instance[handler.property] === 'function') {
                    const sendReply = (ctx, next) => callWithBindHook(ctx, next, instance[handler.property], handler.property);

                    if (handler.trigger) {
                        entity[handler.type](handler.trigger, sendReply)
                    } else {
                        entity[handler.type](sendReply)
                    }
                } else if (typeof instance[handler.property] === 'string') {
                    const sendReply = ctx => ctx.reply(format(instance)(ctx)(instance[handler.property]));

                    if (handler.trigger) {
                        entity[handler.type](handler.trigger, sendReply)
                    } else {
                        entity[handler.type](sendReply)
                    }
                } else if (Array.isArray(instance[handler.property])) {
                    const sendReply = ctx => ctx.reply(format(instance)(ctx)(instance[handler.property].shift()), instance[handler.property]);

                    if (handler.trigger) {
                        entity[handler.type](handler.trigger, sendReply)
                    } else {
                        entity[handler.type](sendReply)
                    }
                }
            }
        })

        methodHandlers.forEach(handler => {
            const middlewares = Metadata.get(C.MIDDLEWARES, handler.handler)

            const bindHandler = (ctx, next) => callMethod(ctx, next, handler.handler.bind(instance), handler.type)

            if (handler.trigger) {
                if (middlewares) {
                    entity[handler.type](handler.trigger, ...middlewares, bindHandler)
                } else {
                    entity[handler.type](handler.trigger, bindHandler)
                }
            } else {
                if (middlewares) {
                    entity[handler.type](...middlewares, bindHandler)
                } else {
                    entity[handler.type](bindHandler)
                }
            }
        })
    }
}
