import { BaseScene, Stage, Middleware, ContextMessageUpdate, SceneContextMessageUpdate, Composer } from 'telegraf';
import * as WizardScene from 'telegraf/scenes/wizard'

import { BotContainer } from './bot-container';
import { Metadata } from './utils';
import * as C from './constants';
import { injector } from './injector';
import { BotInstance } from './bot-instance';

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

        const objectHooks = { ...instance.hooks } || {}
        const userHooks = Metadata.get(C.HOOK, prototype) || []
        const hooks = [ ...Object.entries(objectHooks), ...userHooks ]

        const valueHandlers = Object.getOwnPropertyNames(instance)
            .filter(handler => !propertyHandlers.some(property => handler === property.property))

        const callWithCtx = (ctx, handle) => {
            const hooksResult = hooks.reduce((prevHook: object, hook: string | [string, (arg1: any, arg2: object) => void]) => {
                if (Array.isArray(hook)) {
                    return {
                        ...prevHook,
                        [hook[0]]: hook[1](ctx, prevHook),
                    }
                }
                return {
                    ...prevHook,
                    [hook]: instance[hook](ctx, prevHook),
                }
            }, {})

            return handle(ctx, hooksResult)
        }

        valueHandlers.forEach(handler => {
            if (typeof entity[handler] === 'function' && typeof instance[handler] === 'function') {
                entity[handler](ctx => callWithCtx(ctx, instance[handler]))
            }
        })

        propertyHandlers.forEach(handler => {
            if (typeof entity[handler.type] === 'function' && typeof instance[handler.property] === 'function') {
                if (handler.trigger) {
                    entity[handler.type](handler.trigger, ctx => callWithCtx(ctx, instance[handler.property]))
                } else {
                    entity[handler.type](ctx => callWithCtx(ctx, instance[handler.property]))
                }
            }
        })

        methodHandlers.forEach(handler => {
            const middlewares = Metadata.get(C.MIDDLEWARES, handler.handler)

            const bindHandler = ctx => callWithCtx(ctx, handler.handler.bind(instance))

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
