import { IsEnum } from 'class-validator';
import { CoscradEnum } from '../enums';
import getEnumMetadata from '../enums/getEnumMetadata';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

/**
 *
 * @param labelsAndValues An object with string keys and values. The keys are the
 * user-facing lables and the values are the system-used string values
 */
export function Enum(
    enumName: CoscradEnum,
    userOptions: Partial<TypeDecoratorOptions> = {}
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        const enumMeta = getEnumMetadata(enumName);

        WithValidation(IsEnum(enumMeta.labelsAndValues), options);

        appendMetadata(target, propertyKey, getEnumMetadata(enumName), options);
    };
}
