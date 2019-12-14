import { HearsTriggers } from 'telegraf';

import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const Hears = (trigger: HearsTriggers): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        Metadata.extendArray(HANDLER, [{ type: 'hears', trigger,  handler: descriptor.value }], target)
    }
}
