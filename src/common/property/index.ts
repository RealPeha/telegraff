import { PROPERTY_HANDLER } from '../../constants';
import { Metadata } from '../../utils';

const extendMetadata = (type, property, target, isProperty = false) => {
    Metadata.extendArray(PROPERTY_HANDLER, [{
        type,
        trigger: isProperty ? property[1] || property[0] : false,
        property: property[0]
    }], target)
}

export const start = (target: any, propertyKey: string) => {
    extendMetadata('start', [propertyKey], target)
}

export const use = (target: any, propertyKey: string) => {
    extendMetadata('use', [propertyKey], target)
}

export const leave = (target: any, propertyKey: string) => {
    extendMetadata('leave', [propertyKey], target)
}

export const enter = (target: any, propertyKey: string) => {
    extendMetadata('enter', [propertyKey], target)
}

export const command = (target: any, propertyKey: string) => {
    extendMetadata('command',  [propertyKey], target, true)
}

export const hears = (target: any, propertyKey: string) => {
    extendMetadata('hears',  [propertyKey], target, true)
}

export const on = (target: any, propertyKey: string) => {
    extendMetadata('on', [propertyKey], target, true)
}

export const action = (target: any, propertyKey: string) => {
    extendMetadata('action',  [propertyKey], target, true)
}

export const callback_query = (target: any, propertyKey: string) => {
    extendMetadata('on',  [propertyKey, 'callback_query'], target, true)
}

export const onCatch = (target: any, propertyKey: string) => {
    extendMetadata('catch',  [propertyKey], target, true)
}

export const help = (target: any, propertyKey: string) => {
    extendMetadata('command',  [propertyKey, 'help'], target, true)
}

export const settings = (target: any, propertyKey: string) => {
    extendMetadata('command',  [propertyKey, 'settings'], target, true)
}

export const middleware = (target: any, propertyKey: string) => {
    extendMetadata('use',  [propertyKey], target)
}
