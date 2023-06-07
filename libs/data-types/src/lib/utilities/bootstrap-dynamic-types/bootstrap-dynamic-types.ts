import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { COSCRAD_DATA_TYPE_METADATA } from '../../constants';
import {
    getUnionMemberMetadata,
    getUnionMetadata,
    isUnionMemberMetadata,
    isUnionMetadata,
} from '../../decorators';
import { isSimpleCoscradPropertyTypeDefinition } from '../../types';
import getCoscradDataSchema from './../getCoscradDataSchema';
import { Ctor } from './../getCoscradDataSchemaFromPrototype';
import { leveragesUniontype } from './leverages-union-type';
import { resolveMemberSchemasForUnion } from './resolve-member-schemas-for-union';

type ComplexCoscradDataTypeDefinition = {
    complexDataType: string;
};

export type UnionTypesMap = Map<string, Map<string | number, Ctor<Object>>>;

// We duplicate this here to avoid circular build dependencies
const isComplexCoscradDataTypeDefinition = (
    input: unknown
): input is ComplexCoscradDataTypeDefinition =>
    isNonEmptyString((input as ComplexCoscradDataTypeDefinition).complexDataType);

export const buildUnionTypesMap = (allCtorCandidates: unknown[]): UnionTypesMap => {
    const unionMetadata = allCtorCandidates.map(getUnionMetadata).filter(isUnionMetadata);

    const unionNames = [...new Set(unionMetadata.map(({ unionName }) => unionName))];

    const unionMap: UnionTypesMap = new Map();

    unionNames.forEach((nameOfUnionToValidate) => {
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
            throw new Error(
                `Failed to find a union data-type with the name: ${nameOfUnionToValidate}`
            );
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
            // TODO Break out proper exceptions here
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

        const membersMapForThisUnion = discriminantValuesAndCtors.reduce(
            (acc, [ctor, discriminantValue]: [Ctor<Object>, string | number]) =>
                acc.set(discriminantValue, ctor),
            new Map<string | number, Ctor<Object>>()
        );

        unionMap.set(nameOfUnionToValidate, membersMapForThisUnion);
    });

    return unionMap;
};

export const bootstrapDynamicTypes = (allCtorCandidates: unknown[]) => {
    /**
     * Now we iterate through all classes with `CoscradDataType` definitions,
     * writing the schemas for each union property.
     */
    const ctorsWithTypeDefinitions = allCtorCandidates.filter(
        (input) => !isNullOrUndefined(getCoscradDataSchema(input))
    );

    const ctorsThatLeverageAUnionType = ctorsWithTypeDefinitions.filter((ctor) =>
        leveragesUniontype(getCoscradDataSchema(ctor))
    );

    ctorsThatLeverageAUnionType.forEach((ctor) => {
        const dataSchema = getCoscradDataSchema(ctor);

        const updatedSchema = Object.entries(dataSchema).reduce(
            (acc, [propertyKey, propertyTypeDefinition]) => {
                if (
                    isSimpleCoscradPropertyTypeDefinition(propertyTypeDefinition) ||
                    !['NESTED_TYPE', 'UNION_TYPE'].includes(propertyTypeDefinition.complexDataType)
                )
                    return {
                        ...acc,
                        [propertyKey]: propertyTypeDefinition,
                    };

                const { complexDataType } = propertyTypeDefinition;

                if (complexDataType === 'NESTED_TYPE') {
                    throw new Error(`not implemented: we cannot yet bootstrap nested data types`);
                }

                if (complexDataType === 'UNION_TYPE') {
                    const { unionName } = propertyTypeDefinition;

                    return {
                        ...acc,
                        schemaDefinitions: resolveMemberSchemasForUnion(
                            allCtorCandidates,
                            unionName
                        ),
                    };
                }
            },
            {}
        );

        Reflect.defineMetadata(COSCRAD_DATA_TYPE_METADATA, updatedSchema, ctor.constructor);
    });
};
