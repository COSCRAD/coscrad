import { ValidateNested } from '@coscrad/validation';
import { Type } from 'class-transformer';
import { IsDefined } from 'class-validator';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function NestedDataType(
    NestedDataClass: Object,
    userOptions: Partial<TypeDecoratorOptions> = {}
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        const { isArray, isOptional } = options;

        const validationOptions = { each: isArray };

        if (!isOptional) {
            IsDefined(validationOptions)(target, propertyKey);
        }

        ValidateNested(validationOptions)(target, propertyKey);

        /**
         * This is necessary because `class-validator` piggybacks on the
         * `class-transformer` decorator for nested validation.
         *
         * See [here](https://stackoverflow.com/questions/58343262/class-validator-validate-array-of-objects)
         * for more info.
         */
        Type(() => NestedDataClass as Function)(target, propertyKey);

        appendMetadata(target, propertyKey, getCoscradDataSchema(NestedDataClass), options);
    };
}
