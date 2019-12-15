import { METHOD_HANDLER } from '../../constants'
import { HearsTriggers } from 'telegraf'
import { Metadata } from '../../utils'

export const Action = (trigger: HearsTriggers): MethodDecorator => {
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
        Metadata.extendArray(METHOD_HANDLER, [{ type: 'action', trigger, handler: descriptor.value }], target)
    }
}
