import CoscradDataType from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';
import buildDefaultTypeDecoratorOptions from './common/buildDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function UUID(
    options: TypeDecoratorOptions = buildDefaultTypeDecoratorOptions()
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        appendMetadata(target, propertyKey, CoscradDataType.UUID, options);
    };
}
