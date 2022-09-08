import { IsPositiveInteger } from '@coscrad/validation';
import { CoscradDataType } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function PositiveInteger(userOptions?: Partial<TypeDecoratorOptions>): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(IsPositiveInteger(), options)(target, propertyKey);

        appendMetadata(target, propertyKey, CoscradDataType.PositiveInteger, options);
    };
}
