import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Leave = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'leave', handler: descriptor.value }], target)
    }
}
