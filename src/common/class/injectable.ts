import { injector } from '../../injector';

export const Injectable = () => (constructor) => {
    if (typeof constructor !== 'function') {
        throw new TypeError('Конструктор должен быть функцией');
    }

    if (injector.dependencies.has(constructor)) {
        return;
    }

    injector.dependencies.set(constructor, {
        instance: null,
    });

    const instance = injector.instantiateDependency(constructor)

    return Object.assign(constructor, class {
        static instance = instance
    })
}
