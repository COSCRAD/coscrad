import 'reflect-metadata';
// //////////////////////////////////// The above is a polyfill for the `Reflect` api and must come first
import { CoscradDataType } from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function String(userOptions: TypeDecoratorOptions): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        appendMetadata(target, propertyKey, CoscradDataType.String, options);
    };
}
