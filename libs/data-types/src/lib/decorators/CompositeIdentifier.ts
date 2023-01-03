import { IsCompositeIdentifier, TypeGuard, ValidateNested } from '@coscrad/validation';
import { CoscradDataType } from '../types';

import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function CompositeIdentifier(
    AllowedTypesEnum: Record<string, string>,
    idTypeGuard: TypeGuard<string | number>,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = { ...mixinDefaultTypeDecoratorOptions(userOptions) };

        ValidateNested({ each: true })(target, propertyKey);

        WithValidation(
            IsCompositeIdentifier(AllowedTypesEnum, idTypeGuard, { each: options.isArray }),
            options
        );

        appendMetadata(target, propertyKey, CoscradDataType.CompositeIdentifier, options);
    };
}
