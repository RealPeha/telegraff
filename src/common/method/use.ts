import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Use = (composer?): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'use', handler: descriptor.value }], target)
    }
}
