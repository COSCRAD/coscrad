import { ValidateNested } from '@coscrad/validation';
import { getCoscradDataSchema } from '../utilities';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';

export function NestedDataType(
    nestedDataClass: Object,
    options: Partial<TypeDecoratorOptions> = {}
): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        ValidateNested()(target, propertyKey);

        appendMetadata(
            target,
            propertyKey,
            getCoscradDataSchema(nestedDataClass),
            mixinDefaultTypeDecoratorOptions(options)
        );
    };
}
