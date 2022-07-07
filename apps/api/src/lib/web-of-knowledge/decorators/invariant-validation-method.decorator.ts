import validateSimpleInvariants from '../../../domain/domainModelValidators/utilities/validateSimpleInvariants';
import { isValid, Valid } from '../../../domain/domainModelValidators/Valid';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { InternalError } from '../../errors/InternalError';
import { ValidationResult } from '../../errors/types/ValidationResult';

type ErrorFactoryFunction = (innerErrors: InternalError[], instance: Aggregate) => InternalError;

export function InvariantValidationMethod(
    errorFactoryFunction: ErrorFactoryFunction
): MethodDecorator {
    return function (target: object, _: string | symbol, descriptor: PropertyDescriptor) {
        const childFunction = descriptor.value;

        descriptor.value = function () {
            const simpleValidationResult = validateSimpleInvariants(
                (target as any).constructor,
                this
            );

            const complexValidationResult = childFunction.apply(this) as ValidationResult;

            const allErrors: InternalError[] = [
                ...simpleValidationResult,
                ...(isValid(complexValidationResult) ? [] : complexValidationResult.innerErrors),
            ];

            return allErrors.length > 0 ? errorFactoryFunction(allErrors, this) : Valid;
        };

        return descriptor;
    };
}
