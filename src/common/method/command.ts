import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Command = (trigger: string | string[]): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'command', trigger, handler: descriptor.value }], target)
    }
}
