import { BOT_DATA } from '../../constants';
import { BotModuleData } from '../../interface';
import { Metadata } from '../../utils';

export const Bot = (data: BotModuleData = {}): ClassDecorator => {
    return (target: any) => {
        Metadata.set(BOT_DATA, data, target.prototype);
    }
}
