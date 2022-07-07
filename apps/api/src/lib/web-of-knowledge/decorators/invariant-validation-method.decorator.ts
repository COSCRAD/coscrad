import validateSimpleInvariants from '../../../domain/domainModelValidators/utilities/validateSimpleInvariants';
import { isValid, Valid } from '../../../domain/domainModelValidators/Valid';
import { Aggregate } from '../../../domain/models/aggregate.entity';
import { InternalError } from '../../errors/InternalError';
import { ValidationResult } from '../../errors/types/ValidationResult';

type ErrorFactoryFunction = (innerErrors: InternalError[], instance: Aggregate) => InternalError;

/**
 * Use this decorator on the `validateInvariants` method of any aggregate class
 * to mixin the 'simple validation' rules defined by the `Coscrad Data Type`
 * decorators.
 */
export function InvariantValidationMethod(
    errorFactoryFunction: ErrorFactoryFunction
): MethodDecorator {
    // eslint-disable-next-line
    return function (target: any, _: string | symbol, descriptor: PropertyDescriptor) {
        const childFunction = descriptor.value;

        descriptor.value = function () {
            const simpleValidationResult = validateSimpleInvariants(target.constructor, this);

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
