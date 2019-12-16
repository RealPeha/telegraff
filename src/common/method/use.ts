import { METHOD_HANDLER, MIDDLEWARES } from '../../constants';
import { Metadata } from '../../utils';

export const Use = (...middlewares: any): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'use', handler: descriptor.value }], target)
        if (middlewares.length) {
            Metadata.extendArray(MIDDLEWARES, Array.isArray(middlewares[0]) ? middlewares[0] : middlewares, descriptor.value)
        }
    }
}
