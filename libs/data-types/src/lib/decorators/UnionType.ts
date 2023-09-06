import { ComplexCoscradDataType, UnionDataTypeDefinition } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

// Use property decorator to annotate a union-valued property
export function UnionType(unionName: string, userOptions: TypeDecoratorOptions): PropertyDecorator {
    const options = mixinDefaultTypeDecoratorOptions(userOptions);

    return (target: Object, propertyKey: string | symbol) => {
        const unionDataTypeDefinition: UnionDataTypeDefinition = {
            complexDataType: ComplexCoscradDataType.union,
            unionName,
            // These must be updated at bootstrap
            schemaDefinitions: [],
            discriminantPath: undefined,
        };

        appendMetadata(target, propertyKey, unionDataTypeDefinition, options);
    };
}
