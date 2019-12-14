export class Metadata {
    constructor(private readonly target: object, private readonly module?: object) {}

    public get (trigger: string): any {
        if (Reflect.hasMetadata(trigger, this.target)) {
            const data = Reflect.getMetadata(trigger, this.target);
            if (typeof data === 'function') {
                return data.bind(this.module);
            }
            data.callback = data.callback.bind(this.module);
            return data;
        }
        return Reflect.getMetadata(trigger, this.target);
    }

    public static get(trigger: string, target: object): any {
        return Reflect.getMetadata(trigger, target);
    }

    static set(trigger: string, data: any, target: object): void {
        Reflect.defineMetadata(trigger, data, target);
    }

    public static extendArray<T extends Array<any>>(key: string, data: T, target: object): void {
        const previousValue = Metadata.get(key, target) || [];
        const value = [...previousValue, ...data];
        Metadata.set(key, value, target);
    }
}