import { HANDLER } from '../../constants';
import { Metadata } from '../../utils';

export const CallbackQuery = (): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value
        descriptor.value = function(ctx: any) {
            const returnValue = originalMethod.call(this, ctx)
            if (typeof returnValue.then === 'function') {
                returnValue.then(value => {
                    if (!value) {
                        return ctx.answerCbQuery()
                    }
                    return value
                })
            }
        }
        Metadata.extendArray(HANDLER, [{ type: 'on', trigger: 'callback_query', handler: descriptor.value }], target)
    }
}
