import { InternalError, isInternalError } from '../../lib/errors/InternalError';
import { ResultOrError } from '../../types/ResultOrError';
import { Aggregate } from '../models/aggregate.entity';

export function UpdateMethod(): MethodDecorator {
    return (_target: Object, propertyKey: string | symbol, descriptor: PropertyDescriptor) => {
        const originalImplementation = descriptor.value;

        descriptor.value = function (...args) {
            if (!(this instanceof Aggregate)) {
                throw new InternalError(
                    `A method must belong to an AggregateRoot class in order to be annotated as an update method`
                );
            }

            const cloned = this.clone();

            const updated = originalImplementation.apply(cloned, args) as ResultOrError<Aggregate>;

            if (!updated) {
                throw new Error(
                    `There is a problem with the implementation of: ${JSON.stringify(
                        propertyKey
                    )}. Did you remember to "return this;"?`
                );
            }

            if (isInternalError(updated)) {
                // The update method returned an error
                return updated;
            }

            const invariantValidationResult = updated.validateInvariants();

            if (isInternalError(invariantValidationResult)) {
                // The update method succeeded, but the instance that was built broke an invariant validation rule
                return invariantValidationResult;
            }

            return updated;
        };
    };
}
