import { SCENE } from '../../constants';
import { Metadata } from '../../utils';

export const Scene = (id: string): ClassDecorator => {
    return (target: any) => {
        Metadata.set(SCENE, id, target.prototype);
    }
}
