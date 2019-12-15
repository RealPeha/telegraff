import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Start = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'start', handler: descriptor.value }], target)
    }
}
