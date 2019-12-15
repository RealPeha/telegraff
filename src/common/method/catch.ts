import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Catch = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'catch', handler: descriptor.value }], target)
    }
}
