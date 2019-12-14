import { enter } from 'telegraf/stage'

import { UseMiddlewares } from './useMiddlewares';

export const EnterScene = (scene: string): MethodDecorator => {
    return UseMiddlewares(enter(scene));
}
