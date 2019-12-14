import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Settings = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'command', trigger: 'settings', handler: descriptor.value }], target)
    }
}
