import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Enter = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'enter', handler: descriptor.value }], target)
    }
}
