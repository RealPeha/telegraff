import { METHOD_HANDLER } from '../../constants';
import { UpdateType, MessageSubTypes } from 'telegraf/typings/telegram-types';
import { Metadata } from '../../utils';

export const On = (trigger: UpdateType | UpdateType[] | MessageSubTypes | MessageSubTypes[]): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'on', trigger,  handler: descriptor.value }], target)
    }
}
