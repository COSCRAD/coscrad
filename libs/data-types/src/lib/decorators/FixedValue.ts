import { Equals } from 'class-validator';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function FixedValue(
    value: string | number | boolean,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(Equals(value), options)(target, propertyKey);

        // appendMetadata(target, propertyKey, 'REMOVE ME', options);
    };
}
