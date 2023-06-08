import { CoscradDataType } from '../types';

import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

// TODO move this to a utility types lib
type TypeGuard<T> = (input: unknown) => input is T;

// @deprecated Use @NestedDataType(CustomCompositeIdentifierClass,options) instead
export function CompositeIdentifier(
    AllowedTypesEnum: Record<string, string>,
    idTypeGuard: TypeGuard<string | number>,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = { ...mixinDefaultTypeDecoratorOptions(userOptions) };

        appendMetadata(target, propertyKey, CoscradDataType.CompositeIdentifier, options);
    };
}
