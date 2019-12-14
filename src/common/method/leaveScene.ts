import { leave } from 'telegraf/stage'

import { UseMiddlewares } from './useMiddlewares';

export const LeaveScene = (): MethodDecorator => {
    return UseMiddlewares(leave());
}
