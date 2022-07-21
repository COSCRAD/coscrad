import { IsStringWithNonzeroLength } from '@coscrad/validation';
import 'reflect-metadata';
import CoscradDataType from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function NonEmptyString(userOptions: Partial<TypeDecoratorOptions> = {}): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(IsStringWithNonzeroLength(), options)(target, propertyKey);

        appendMetadata(target, propertyKey, CoscradDataType.NonEmptyString, options);
    };
}
