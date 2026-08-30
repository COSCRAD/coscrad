import { ComplexCoscradDataType, NestedTypeDefinition } from '../types';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import { Ctor } from '../utilities/getCoscradDataSchemaFromPrototype';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types';

type GetCtor = () => Ctor<unknown>;

export function LookupTable(
    type: GetCtor | 'string' | 'integer' | 'number' | 'boolean',
    userOptions: TypeDecoratorOptions
): PropertyDecorator {
    return function (target: object, propertyKey: string | symbol) {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        const nestedDataTypeDefinition: NestedTypeDefinition = {
            complexDataType: ComplexCoscradDataType.nested,
            schema: getCoscradDataSchema(type),
            // @ts-expect-error Fix types
            name: type,
        };

        appendMetadata(
            target,
            propertyKey,
            // TODO Make a factory function or constructor instead of doing this
            nestedDataTypeDefinition,
            options
        );
    };
}
