import { ExtraReplyMessage } from 'telegraf/typings/telegram-types'

export const Extra = (extra: ExtraReplyMessage = {}): MethodDecorator => {
    return (target: any, method: string, descriptor: PropertyDescriptor) => {
        const originalMethod = descriptor.value
        descriptor.value = function(ctx: any) {
            ctx.extra = extra
            return originalMethod.call(this, ctx)
        }
    }
}
