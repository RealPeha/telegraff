import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Start = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'start', handler: descriptor.value }], target)
    }
}
