import { BaseScene, Stage, Middleware, ContextMessageUpdate, SceneContextMessageUpdate, Composer } from 'telegraf';
import * as WizardScene from 'telegraf/scenes/wizard'

import { BotContainer } from './bot-container';
import { Metadata } from './utils';
import * as C from './constants';
import { injector } from './injector';
import { BotInstance } from './bot-instance';

export class ModuleLoader {
    constructor(private readonly container: BotContainer) {}

    loadMiddlewares(modules: Array<any> | any): void {
        const bot: BotInstance = this.container.getBot();

        modules.forEach(module => {
            const moduleMiddlewares: Middleware<ContextMessageUpdate>[] = Metadata.get(C.BOT_DATA, module.prototype).middlewares;
            if (moduleMiddlewares && Array.isArray(moduleMiddlewares)) {
                moduleMiddlewares.forEach((middleware: Middleware<ContextMessageUpdate>) => {
                    bot.instance.use(middleware);
                })
            }
        });
    }

    loadScenes(modules: Array<any> | any): void {
        const bot: BotInstance = this.container.getBot();

        modules.forEach(module => {
            const moduleScenes = Metadata.get(C.BOT_DATA, module.prototype).scenes;
            if (moduleScenes) {
                if (Array.isArray(moduleScenes)) {
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
                } else {
                    throw new Error('scenes must be an array')
                }
            }
        });
    }

    loadComposers(modules: Array<any> | any): void {
        const bot: BotInstance = this.container.getBot();

        const composers: Composer<SceneContextMessageUpdate>[] = [];
        modules.forEach(module => {
            const moduleComposers = Metadata.get(C.BOT_DATA, module.prototype).composers;
            if (moduleComposers) {
                if (Array.isArray(moduleComposers)) {
                    moduleComposers.forEach(composerModule => {
                        const composer: Composer<SceneContextMessageUpdate> = new Composer();
                        this.loadComposerMetadata(composer, composerModule)
                        // console.log('composerModule', composerModule)
                        // Metadata.set(C.COMPOSER, composer, composerModule)
                        composers.push(composer);
                    })
                } else {
                    throw new Error('composers must be an array')
                }
            }
        })

        if (composers.length) {
            composers.forEach((composer: Composer<SceneContextMessageUpdate>) => {
                bot.instance.use(composer.middleware());
            })
        }
    }

    loadMetadata(modules: Array<any> | any): void {
        const bot: any = this.container.getBot();

        modules.forEach(module => {
            const instanceModule = injector.instantiateDependency(module);
            this.bindHandlers(bot.instance, instanceModule)
        })
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
        const handlers = Metadata.get(C.HANDLER, prototype) || []

        handlers.forEach(handler => {
            const middlewares = Metadata.get(C.MIDDLEWARES, handler.handler)

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
