import { MIDDLEWARES } from '../../constants';
import { Metadata } from '../../utils';

export const UseMiddlewares = (...middlewares: any): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(MIDDLEWARES, Array.isArray(middlewares[0]) ? middlewares[0] : middlewares, descriptor.value)
    }
}
