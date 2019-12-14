import { injector } from '../../injector';

export const Middleware = (): ClassDecorator => {
    return (target: any) => {
        if (!target.prototype.handler) {
            throw new Error(`Middleware handler not found!`)
        }
        const middlewareModuleInstance = injector.instantiateDependency(target);
        return target.prototype.handler.bind(middlewareModuleInstance)
    }
}
