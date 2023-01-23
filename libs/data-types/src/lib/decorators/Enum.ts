import { CoscradEnum } from '../enums';
import getCoscradEnumFromName from '../enums/getCoscradEnumFromName';
import getEnumMetadata from '../enums/getEnumMetadata';
import { EnumTypeDefinition } from '../types/ComplexDataTypes/EnumTypeDefinition';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

/**
 *
 * @deprecated Use `ExternalEnum` and define your labels and metadata
 * in line. We shouldn't be managing enums here. Perhaps API interfaces
 * is a better place, so we can share them statically with the front-end?
 */
export function Enum(enumName: CoscradEnum, userOptions: TypeDecoratorOptions): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        const coscradEnum = getCoscradEnumFromName(enumName);

        const enumDataTypeDefinition: EnumTypeDefinition = {
            ...getEnumMetadata(enumName),
        };

        appendMetadata(target, propertyKey, enumDataTypeDefinition, options);
    };
}
