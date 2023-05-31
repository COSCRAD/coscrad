import { isNonEmptyString, isNullOrUndefined } from '@coscrad/validation-constraints';
import { COSCRAD_DATA_TYPE_METADATA } from '../constants';
import {
    getUnionMemberMetadata,
    getUnionMetadata,
    isUnionMemberMetadata,
    isUnionMetadata,
} from '../decorators';
import getCoscradDataSchema from './getCoscradDataSchema';
import { Ctor } from './getCoscradDataSchemaFromPrototype';

type ComplexCoscradDataTypeDefinition = {
    complexDataType: string;
};

// We duplicate this here to avoid circular build dependencies
const isComplexCoscradDataTypeDefinition = (
    input: unknown
): input is ComplexCoscradDataTypeDefinition =>
    isNonEmptyString((input as ComplexCoscradDataTypeDefinition).complexDataType);

export const bootstrapDynamicTypes = (allCtorCandidates: unknown[]) => {
    const unionMetadata = allCtorCandidates.map(getUnionMetadata).filter(isUnionMetadata);
    // .filter(({ unionName }) => unionName === nameOfUnionToValidate);

    const unionNames = [...new Set(unionMetadata.map(({ unionName }) => unionName))];

    const unionMap = new Map<string, Map<string | number, Ctor<Object>>>();

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

        const membersMapForThisUnion = discriminantValuesAndCtors.reduce(
            (acc, [ctor, discriminantValue]: [Ctor<Object>, string | number]) =>
                acc.set(discriminantValue, ctor),
            new Map<string | number, Ctor<Object>>()
        );

        unionMap.set(nameOfUnionToValidate, membersMapForThisUnion);
    });

    /**
     * Now we iterate through all classes with `CoscradDataType` definitions,
     * writing the schemas for each union property.
     */
    const ctorsWithTypeDefinitions = allCtorCandidates.filter(
        (input) => !isNullOrUndefined(getCoscradDataSchema(input))
    );

    ctorsWithTypeDefinitions.forEach((c) => {
        const dataSchema = getCoscradDataSchema(c);

        const updates = Object.entries(dataSchema).reduce(
            (acc, [propertyKey, dataSchemaForProperty]) => {
                if (
                    isComplexCoscradDataTypeDefinition(dataSchemaForProperty) &&
                    dataSchemaForProperty.complexDataType === 'UNION_TYPE'
                ) {
                    const { unionName } = dataSchemaForProperty;

                    if (!unionMap.has(unionName)) {
                        /**
                         * This situation is impossible by design. The only way
                         * for the union name to appear on a data schema is to
                         * register the union. We add this logic out of an
                         * abundance of caution.
                         */
                        throw new Error(
                            `The union: ${unionName} that appears on property: ${propertyKey} of ${dataSchemaForProperty.label} has not been registered `
                        );
                    }

                    const unionMemberSchemaDefinitons = unionMap.get(unionName);

                    const unionMemberSchemaDefinitions = [
                        ...unionMemberSchemaDefinitons.entries(),
                    ].map(([discriminantValue, ctor]) => ({
                        discriminant: discriminantValue,
                        schema: getCoscradDataSchema(ctor),
                    }));

                    return {
                        ...acc,
                        [propertyKey]: {
                            schemaDefinitions: unionMemberSchemaDefinitions,
                        },
                    };
                } else {
                    /**
                     * no-op
                     *
                     * Note that it is not necessary to recurse as every class
                     * using data decorators should be exposed to the IoC
                     * registry.
                     */
                    return acc;
                }
            },
            {} as Record<string, { schemaDefinitions: unknown }>
        );

        Object.entries(updates).forEach(
            ([propertyKey, { schemaDefinitions: unionDataSchemasForThisProperty }]) => {
                const existingMeta = getCoscradDataSchema(c);

                const newMeta = {
                    ...existingMeta,
                    [propertyKey]: {
                        ...existingMeta[propertyKey],
                        schemaDefinitions: unionDataSchemasForThisProperty,
                    },
                };

                Reflect.defineMetadata(
                    COSCRAD_DATA_TYPE_METADATA,
                    newMeta,
                    // @ts-expect-error TODO fix me
                    c.prototype
                );
            }
        );
    });

    /**
     * Now we iterate through all known classes that leverage a union,
     * setting the schema from the union members.
     */

    // const allClassesLeveragingAUnion = allCtorCandidates.filter((input) =>
    //     isUnionMemberMetadata(getUnionMemberMetadata(input))
    // );

    // allClassesLeveragingAUnion.forEach((classReference) => {
    //     const { unionName } = getUnionMetadata(classReference) as UnionMetadata;

    //     // We already have checked for this this above

    //     const existingTypeMeta = Reflect.getMetadata(
    //         COSCRAD_DATA_TYPE_METADATA,
    //         // @ts-expect-error TODO fix types
    //         classReference.prototype
    //     );

    //     if (!existingTypeMeta) {
    //         throw new Error(
    //             `There is no COSCRAD data-type metadata for class: ${classReference} that leverages a union: ${unionName}`
    //         );
    //     }

    //     const schemaDefinitions = unionMap.get(unionName).forEach((ctor, discriminantValue) => ({
    //         discriminant: discriminantValue,
    //         schema: getCoscradDataSchema(ctor),
    //     }));

    //     Reflect.defineMetadata(
    //         COSCRAD_DATA_TYPE_METADATA,
    //         {
    //             ...existingTypeMeta,
    //             schemaDefinitions,
    //         },
    //         classReference
    //     );
    // });
};
