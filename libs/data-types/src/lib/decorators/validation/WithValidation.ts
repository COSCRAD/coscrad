import { IsOptional } from '@coscrad/validation';
import { TypeDecoratorOptions } from '../types/TypeDecoratorOptions';

export default (
        validationDecorator: PropertyDecorator,
        { isOptional }: Pick<TypeDecoratorOptions, 'isOptional'>
    ): PropertyDecorator =>
    (target: Object, propertyKey: string | symbol) => {
        if (isOptional) {
            IsOptional()(target, propertyKey);
        }

        validationDecorator(target, propertyKey);
    };
