import { IsNotEmpty, IsString } from 'class-validator';
import 'reflect-metadata';
import { CoscradDataType } from '../types/CoscradDataType';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function NonEmptyString(userOptions: Partial<TypeDecoratorOptions> = {}): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(IsString({ each: options.isArray }), options)(target, propertyKey);

        IsNotEmpty({ each: options.isArray })(target, propertyKey);

        appendMetadata(target, propertyKey, CoscradDataType.NonEmptyString, options);
    };
}
