interface Dependency<T> {
    instance: T;
}

export const injector = new class Injector {
    public dependencies = new WeakMap<any, Dependency<any>>();

    public getDependency(constructor) {
        const dependency = this.dependencies.get(constructor);

        if (!dependency) {
            throw new Error(`Service ${constructor.name} not found`);
        }

        if (!dependency.instance) {
            dependency.instance = this.instantiateDependency(constructor);
        }

        return dependency.instance;
    }

    getParamTypes(constructor): undefined | any[] {
        return Reflect.getOwnMetadata('design:paramtypes', constructor);
    }

    getDependencies(constructor): undefined | any[] {
        const types = this.getParamTypes(constructor);

        if (!types) {
            return undefined;
        }

        return types.map((type) => this.getDependency(type));
    }

    instantiateDependency(constructor) {
        const constructorArguments = this.getDependencies(constructor);

        if (constructorArguments) {
            return new constructor(...constructorArguments);
        }

        return new constructor();
    }
}
