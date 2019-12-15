import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Settings = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'command', trigger: 'settings', handler: descriptor.value }], target)
    }
}
