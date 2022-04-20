import { InternalError } from 'apps/api/src/lib/errors/InternalError';
import { ContextModelUnion } from '../../models/context/types/ContextModelUnion';
import { isEdgeConnectionContextType } from '../../models/context/types/EdgeConnectionContextType';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import InvalidEdgeConnectionContextModelError from '../errors/context/InvalidEdgeConnectionContextModelError';
import InvalidEdgeConnectionContextTypeError from '../errors/context/InvalidEdgeConnectionContextTypeError';
import NullOrUndefinedEdgeConnectionContextDTOError from '../errors/context/NullOrUndefinedEdgeConnectionContextDTOError';
import { isValid, Valid } from '../Valid';
import getContextTypeWithContextModelInvariantValidators from './getContextTypeWithContextModelInvariantValidators';

/**
 * This is an alternative implementation of the `chain of validators` pattern
 * experimented with elsewhere in `buildGeometricFeatureValidatorChain`. The difference
 * is that there the validators themselves where aware of what type of model they
 * were looking for, whereas here, we register the validators with the type of
 * the model (here `EdgeConnectionContextType`) externally in an array of tuples
 * and pattern match the types only at the top level.
 */
export default (contextModel: ContextModelUnion): Valid | InternalError => {
    if (isNullOrUndefined(contextModel)) return new NullOrUndefinedEdgeConnectionContextDTOError();

    const { type } = contextModel;

    if (!isEdgeConnectionContextType(type)) return new InvalidEdgeConnectionContextTypeError(type);

    const allErrors = getContextTypeWithContextModelInvariantValidators().reduce(
        (accumulatedErrors: InternalError[], [validatorContextType, validate]) => {
            // Ensure at most one validator runs its logic against the contextModel
            if (accumulatedErrors.length > 0) return accumulatedErrors;

            // defer to the next validator as this one doesn't handle the context model's type
            if (type !== validatorContextType) return accumulatedErrors;

            // If we made it here, our validator is for the context model's context type
            const validationResult = validate(contextModel);

            return isValid(validationResult)
                ? accumulatedErrors
                : accumulatedErrors.concat(validationResult);
        },
        []
    );

    return allErrors.length > 0 ? new InvalidEdgeConnectionContextModelError(allErrors) : Valid;
};
