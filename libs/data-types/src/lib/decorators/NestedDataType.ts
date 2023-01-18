import { Type } from 'class-transformer';
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

        /**
         * This used to be necessary because `class-validator` piggybacks on the
         * `class-transformer` decorator for nested validation. We no longer use `class-validator`.
         *
         * See [here](https://stackoverflow.com/questions/58343262/class-validator-validate-array-of-objects)
         * for more info.
         *
         * Is this still needed?
         */
        Type(() => NestedDataClass as Function)(target, propertyKey);

        const nestedDataTypeDefinition: NestedTypeDefinition = {
            complexDataType: ComplexCoscradDataType.nested,
            schema: getCoscradDataSchema(NestedDataClass),
        };

        appendMetadata(target, propertyKey, nestedDataTypeDefinition, options);
    };
}
