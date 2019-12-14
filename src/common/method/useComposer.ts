export const UseComposer = (composer: any): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        descriptor.value = composer.composer

        return descriptor
    }
}
