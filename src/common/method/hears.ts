import { HearsTriggers } from 'telegraf';

import { METHOD_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Hears = (trigger: HearsTriggers): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'hears', trigger,  handler: descriptor.value }], target)
    }
}
