import {
    getUnionMemberMetadata,
    getUnionMetadata,
    isUnionMemberMetadata,
    isUnionMetadata,
} from '../decorators';
import { Ctor } from '../utilities/getCoscradDataSchemaFromPrototype';
import buildSimpleValidationFunction from './buildSimpleValidationFunction';
import { SimpleValidationError, SimpleValidationFunction } from './interfaces';

export const buildUnionModelValidationFunction = (
    nameOfUnionToValidate: string,
    allCtorCandidates: unknown[],
    { forbidUnknownValues }: { forbidUnknownValues: boolean } = { forbidUnknownValues: true }
): SimpleValidationFunction => {
    const unionMetadata = allCtorCandidates
        .map(getUnionMetadata)
        .filter(isUnionMetadata)
        .filter(({ unionName }) => unionName === nameOfUnionToValidate);

    const allDiscriminantPathsRegisteredForThisUnion = [
        ...new Set(unionMetadata.map(({ discriminantPath }) => discriminantPath)),
    ];

    // TODO It would be nice to design this away
    if (allDiscriminantPathsRegisteredForThisUnion.length > 1) {
        throw new Error(
            `You have defined more than one union data-type with the name: ${nameOfUnionToValidate}`
        );
    }

    if (allDiscriminantPathsRegisteredForThisUnion.length < 1) {
        throw new Error(`Failed to find a union data-type with the name: ${nameOfUnionToValidate}`);
    }

    const { discriminantPath } = unionMetadata[0];

    if (discriminantPath.includes('.')) {
        const msg = [
            `Using a nested property`,
            `as a discriminant is not supported.`,
            `Decorate the property on the nested data class instead`,
        ].join(' ');

        throw new Error(msg);
    }

    const discriminantValuesAndCtors = allCtorCandidates
        .map(getUnionMemberMetadata)
        .filter(isUnionMemberMetadata)
        .filter(({ unionName }) => nameOfUnionToValidate === unionName)
        .map(({ ctor, discriminantValue }) => [ctor, discriminantValue]);

    if (discriminantValuesAndCtors.length === 0) {
        // TODO Break out proper exceptions here and test for these
        throw new Error(
            `Failed to find any union members (sub-type classes) for the union: ${nameOfUnionToValidate}`
        );
    }

    const duplicateDiscriminants = discriminantValuesAndCtors
        .map(([_ctor, discriminantValue]) => discriminantValue)
        .reduce(
            (acc: { unique: unknown[]; duplicates: unknown[] }, discriminantValue) => {
                const { unique, duplicates } = acc;

                if (duplicates.includes(discriminantValue)) return acc;

                if (unique.includes(discriminantValue))
                    return {
                        unique,
                        duplicates: [...duplicates, discriminantValue],
                    };

                return {
                    duplicates,
                    unique: [...unique, discriminantValue],
                };
            },
            {
                unique: [],
                duplicates: [],
            }
        ).duplicates;

    if (duplicateDiscriminants.length > 0) {
        throw new Error(
            `The following values are reused as union data-type discriminants: ${[
                ...new Set(duplicateDiscriminants),
            ].join(', ')}`
        );
    }

    return (input: unknown): SimpleValidationError[] => {
        const discriminantValueForInput = input[discriminantPath];

        const searchResult = discriminantValuesAndCtors.find(
            ([_ctor, discriminantValue]) => discriminantValue === discriminantValueForInput
        );

        if (!searchResult)
            return [
                new Error(
                    `The value [${discriminantValueForInput}] is not allowed for the property type on a member of the union: ${nameOfUnionToValidate}`
                ),
            ];

        const [ctor, _discriminantValue] = searchResult;

        return buildSimpleValidationFunction(ctor as Ctor<Object>, { forbidUnknownValues })(input);
    };
};
