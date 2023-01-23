import { ComplexCoscradDataType, EnumTypeDefinition } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function ExternalEnum(
    enumTypeDefinition: Omit<EnumTypeDefinition, 'complexDataType'>,
    userOptions: TypeDecoratorOptions
) {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        appendMetadata(
            target,
            propertyKey,
            // TODO Make a factory function or constructor instead of doing this
            { ...enumTypeDefinition, complexDataType: ComplexCoscradDataType.enum },
            options
        );
    };
}
