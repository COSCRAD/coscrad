import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import buildDefaultTypeDecoratorOptions from './common/buildDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function NestedDataType(
    nestedDataClass: Object,
    options: TypeDecoratorOptions = buildDefaultTypeDecoratorOptions()
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        appendMetadata(target, propertyKey, getCoscradDataSchema(nestedDataClass), options);
    };
}
