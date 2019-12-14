import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Help = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'command', trigger: 'help', handler: descriptor.value }], target)
    }
}
