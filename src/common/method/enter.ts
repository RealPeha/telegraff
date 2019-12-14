import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Enter = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'enter', handler: descriptor.value }], target)
    }
}
