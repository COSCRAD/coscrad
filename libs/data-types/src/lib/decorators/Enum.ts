import { IsEnum } from 'class-validator';
import { CoscradEnum } from '../enums';
import getCoscradEnumFromName from '../enums/getCoscradEnumFromName';
import getEnumMetadata from '../enums/getEnumMetadata';
import { EnumTypeDefinition } from '../types/ComplexDataTypes/EnumTypeDefinition';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function Enum(enumName: CoscradEnum, userOptions: TypeDecoratorOptions): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(
            IsEnum(getCoscradEnumFromName(enumName), { each: options.isArray }),
            options
        )(target, propertyKey);

        const enumDataTypeDefinition: EnumTypeDefinition = {
            ...getEnumMetadata(enumName),
        };

        appendMetadata(target, propertyKey, enumDataTypeDefinition, options);
    };
}
