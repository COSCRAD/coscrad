import { DiscriminatedUnionValidator, SimpleValidationFunction } from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';
import validateSimpleInvariants from './validateSimpleInvariants';

type UnionMemberCtors = Record<string, DomainModelCtor>;

// TODO remove if not used
/**
 * This helper should only be used with models that have only simple invariant
 * rules (i.e. 'generalized type' rules and no complex invariants that require
 * accessing multiple properties). It will build a domain model invariant validator
 * function for a discriminated union's classes by gathering the simple invariant rules
 * from its decorated properties.
 */
export const buildSimpleDiscriminatedUnionValidationFunction = (
    unionMemberCtors: UnionMemberCtors
) => {
    const typeAndCtorPairs = Object.entries(unionMemberCtors);

    const typeAndSimpleValidatorPairs = typeAndCtorPairs.map(([type, ctor]) => [
        type,
        (input) => validateSimpleInvariants(ctor, input),
    ]) as [string, SimpleValidationFunction][];

    const allTypes = typeAndCtorPairs.map(([type, _]) => type);

    const discriminatedUnionValidator = new DiscriminatedUnionValidator(
        allTypes,
        'type'
    ).registerAllValidationFunctions(typeAndSimpleValidatorPairs);

    return (input: unknown) => {
        const result = discriminatedUnionValidator
            .validate(input)
            /**
             * This is a bit of a hack. We have to package the validation results
             * that were internal to the validation library in our own `InternalError`
             * classes on this end.
             */
            .map((error) =>
                error instanceof InternalError ? error : new InternalError(error.toString())
            );

        return result;
    };
};
