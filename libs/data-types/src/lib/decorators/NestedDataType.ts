import { IsNonEmptyObject, ValidateNested } from '@coscrad/validation';
import { Type } from 'class-transformer';
import { IsDefined, IsOptional } from 'class-validator';
import { ComplexCoscradDataType } from '../types/ComplexDataTypes/ComplexCoscradDataType';
import { NestedTypeDefinition } from '../types/ComplexDataTypes/NestedTypeDefinition';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function NestedDataType(
    NestedDataClass: Object,
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        const { isArray, isOptional } = options;

        const validationOptions = { each: isArray };

        /**
         * For some reason, class-validator returns a false-negative whenever
         * we have a nested, non-array, property, unless we also wrap with the
         * following.
         */
        if (!isArray) {
            IsNonEmptyObject()(target, propertyKey);
        }

        if (isOptional) IsOptional()(target, propertyKey);

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

        const nestedDataTypeDefinition: NestedTypeDefinition = {
            complexDataType: ComplexCoscradDataType.nested,
            schema: getCoscradDataSchema(NestedDataClass),
        };

        appendMetadata(target, propertyKey, nestedDataTypeDefinition, options);
    };
}
