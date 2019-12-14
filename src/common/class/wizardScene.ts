import { WIZARD_SCENE } from '../../constants';
import { Metadata } from '../../utils';

export const WizardScene = (id: string): ClassDecorator => {
    return (target: any) => {
        Metadata.set(WIZARD_SCENE, id, target.prototype);
    }
}
