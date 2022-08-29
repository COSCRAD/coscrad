import { IsISBN } from 'class-validator';
import { CoscradDataType } from '../types';
import appendMetadata from '../utilities/appendMetadata';
import mixinDefaultTypeDecoratorOptions from './common/mixinDefaultTypeDecoratorOptions';
import { TypeDecoratorOptions } from './types/TypeDecoratorOptions';
import WithValidation from './validation/WithValidation';

export function ISBN(userOptions?: Partial<TypeDecoratorOptions>): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const options = mixinDefaultTypeDecoratorOptions(userOptions);

        WithValidation(IsISBN(), options)(target, propertyKey);

        appendMetadata(target, propertyKey, CoscradDataType.ISBN, options);
    };
}
