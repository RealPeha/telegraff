import { BaseScene, Stage, Middleware, ContextMessageUpdate, SceneContextMessageUpdate, Composer } from 'telegraf';
import * as WizardScene from 'telegraf/scenes/wizard'

import { BotContainer } from './bot-container';
import { Metadata, bindArrow as bind } from './utils';
import * as C from './constants';
import { injector } from './injector';
import { BotInstance } from './bot-instance';
// const { parse } = require('regexp-tree')

export class ModuleLoader {
    constructor(private readonly container: BotContainer) {}

    loadMiddlewares(module: any): void {
        const bot: BotInstance = this.container.getBot();

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
            let defaultScene;
            const scenes = moduleScenes.map(moduleScene => {
                if (Metadata.get(C.WIZARD_SCENE, moduleScene.prototype)) {
                    const sceneName: string = Metadata.get(C.WIZARD_SCENE, moduleScene.prototype)
                    defaultScene = moduleScene.default && sceneName
                    const methodsName = Object.getOwnPropertyNames(moduleScene.prototype).filter(name => name !== 'constructor')
                    const methods = methodsName.map(name => moduleScene.prototype[name])

                    const scene: BaseScene<SceneContextMessageUpdate> = new WizardScene(sceneName, ...methods)
                    return scene
                } else {
                    const sceneName: string = Metadata.get(C.SCENE, moduleScene.prototype)
                    const sceneOptions = moduleScene.options || {}

                    defaultScene = moduleScene.default && sceneName

                    const scene: BaseScene<SceneContextMessageUpdate> = new BaseScene(sceneName, sceneOptions)
                    this.loadSceneMetadata(scene, moduleScene)
                    return scene
                }
            })
            const stage = new Stage(scenes, {
                default: defaultScene,
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
            : userHooks

        const valueHandlers = Object.getOwnPropertyNames(instance)
            .filter(handler => !propertyHandlers.some(property => handler === property.property))

        const callWithCtx = (ctx, next, handle, type) => {
            const hooksResult = hooks.reduce((prevHookResult: object, hook: string | [string, (arg1: any, arg2: object) => void] | Function) => {
                if (Array.isArray(hook)) {
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
                return {
                    ...prevHookResult,
                    [hook]: instance[hook](ctx, prevHookResult),
                }
            }, {})
            const context = bindHooks ? hooksResult : instance

            if (type === 'use') {
                if (disableContext) {
                    return bind(handle, hooksResult, ctx, next).call(context)
                }
                return bind(handle, ctx, next, hooksResult).call(context)
            }
            if (disableContext) {
                return bind(handle, hooksResult, ctx, next).call(context)
            }
            return bind(handle, ctx, hooksResult).call(context)
        }

        valueHandlers.forEach(handler => {
            if (typeof entity[handler] === 'function' && typeof instance[handler] === 'function') {
                entity[handler]((ctx, next) => callWithCtx(ctx, next, instance[handler], handler))
            }
        })

        propertyHandlers.forEach(handler => {
            if (typeof entity[handler.type] === 'function' && typeof instance[handler.property] === 'function') {
                if (handler.trigger) {
                    entity[handler.type](handler.trigger, (ctx, next) => callWithCtx(ctx, next, instance[handler.property], handler.property))
                } else {
                    entity[handler.type]((ctx, next) => callWithCtx(ctx, next, instance[handler.property], handler.property))
                }
            }
        })

        methodHandlers.forEach(handler => {
            const middlewares = Metadata.get(C.MIDDLEWARES, handler.handler)

            // const bindHandler = (ctx, next) => callWithCtx(ctx, next, handler.handler.bind(instance), handler.type)
            const bindHandler = handler.handler.bind(instance)

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
