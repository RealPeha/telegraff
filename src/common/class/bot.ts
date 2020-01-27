import { BOT_DATA } from '../../constants';
import { BotModuleData } from '../../interface';
import { Metadata } from '../../utils';
import { BotFactory } from '../../'

interface Anything {
    [key: string]: any;
}

export const Bot = (data: BotModuleData = {}): any => {
    return (target: any) => {
        Metadata.set(BOT_DATA, data, target.prototype);

        return Object.assign(target, class {
            static bot = () => BotFactory.create(target)
            static launch = () => BotFactory.create(target).launch()
        })
    }
}
