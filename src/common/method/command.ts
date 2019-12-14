import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Command = (trigger: string | string[]): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'command', trigger, handler: descriptor.value }], target)
    }
}
