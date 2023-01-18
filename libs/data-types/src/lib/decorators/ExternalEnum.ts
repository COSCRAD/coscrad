import { EnumTypeDefinition } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function ExternalEnum(
    enumTypeDefinition: EnumTypeDefinition,
    userOptions: TypeDecoratorOptions
) {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        appendMetadata(target, propertyKey, enumTypeDefinition, options);
    };
}
