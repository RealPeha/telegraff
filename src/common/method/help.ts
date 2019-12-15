import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Help = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'command', trigger: 'help', handler: descriptor.value }], target)
    }
}
