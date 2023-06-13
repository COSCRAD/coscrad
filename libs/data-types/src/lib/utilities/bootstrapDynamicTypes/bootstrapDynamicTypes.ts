import { isNullOrUndefined } from '@coscrad/validation-constraints';
import { COSCRAD_DATA_TYPE_METADATA } from '../../constants';
import {
    getUnionMemberMetadata,
    getUnionMetadata,
    isUnionMemberMetadata,
    isUnionMetadata,
} from '../../decorators';
import { CoscradPropertyTypeDefinition, isSimpleCoscradPropertyTypeDefinition } from '../../types';
import getCoscradDataSchema from '../getCoscradDataSchema';
import { Ctor } from '../getCoscradDataSchemaFromPrototype';
import { leveragesUniontype } from './leveragesUnionType';
import { resolveMemberSchemasForUnion } from './resolveMemberSchemasForUnion';

type MembersMap<T = unknown> = Map<string, Ctor<T>>;

export type UnionTypeInfo<T> = {
    discriminantPath: string;
    membersMap: MembersMap<T>;
};

export type UnionTypesMap<T = unknown> = Map<string, UnionTypeInfo<T>>;

// TODO Break this out into a separate file
export const buildUnionTypesMap = <T = unknown>(allCtorCandidates: Ctor<T>[]): UnionTypesMap<T> => {
    const unionMetadata = allCtorCandidates.map(getUnionMetadata).filter(isUnionMetadata);

    const unionNames = [...new Set(unionMetadata.map(({ unionName }) => unionName))];

    const unionMap: UnionTypesMap = new Map();

    unionNames.forEach((nameOfUnionToValidate) => {
        const allDiscriminantPathsRegisteredForThisUnion = [
            ...new Set(unionMetadata.map(({ discriminantPath }) => discriminantPath)),
        ];

        /**
         * Note that when using the @Union decorator factory, it's best practice to
         * export a single decorator factory per union that curries the property-specific
         * user options but closes over the `unionName` and `discriminantPath`.
         *
         * ```ts
         * export const MachineUnion = (options) => @Union('MACHINE_UNION','type',options)
         *
         * // ...
         *
         * @MachineUnion({
         *     label: 'machine',
         *     description: 'the machine that is in this location'
         * })
         * readonly machine: Widget | Whatsit;
         * ```
         */
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
            .map(({ ctor, discriminant: discriminantValue }) => [ctor, discriminantValue]);

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
            (acc, [ctor, discriminantValue]: [Ctor<Object>, string]) =>
                acc.set(discriminantValue, ctor),
            new Map<string, Ctor<Object>>()
        );

        unionMap.set(nameOfUnionToValidate, {
            discriminantPath,
            membersMap: membersMapForThisUnion,
        });
    });

    // @ts-expect-error Fix me
    return unionMap;
};

const mixUnionMemberSchemasIntoTypeDefinitionForClass = (
    allCtorCandidates: unknown[],
    dataSchema: ReturnType<typeof getCoscradDataSchema>
): CoscradPropertyTypeDefinition => {
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
                const { schema: nestedSchema } = propertyTypeDefinition;

                return {
                    ...acc,
                    [propertyKey]: {
                        ...propertyTypeDefinition,
                        schema: mixUnionMemberSchemasIntoTypeDefinitionForClass(
                            allCtorCandidates,
                            // @ts-expect-error fix me
                            nestedSchema
                        ),
                    },
                };
            }

            if (complexDataType === 'UNION_TYPE') {
                const { unionName } = propertyTypeDefinition;

                return {
                    ...acc,
                    [propertyKey]: {
                        ...propertyTypeDefinition,
                        schemaDefinitions: resolveMemberSchemasForUnion(
                            allCtorCandidates,
                            unionName
                        ),
                    },
                };
            }
        },
        {}
    );

    return updatedSchema as CoscradPropertyTypeDefinition;
};

/**
 * When leveraging union types it is important that every class has been registered
 * first. Because we want to avoid shared references to these classes to minimize
 * coupling and circular dependencies, we piece the union member schemas back together
 * at bootstrap. You must call `bootstrapDynamictypes` once at bootstrap, passing
 * in an array of class ctor references for your data classes. In NestJS, we do
 * this by walking the IoC containers but we do not assume anything about
 * the client's dependency injection framework in this lib.
 */
export const bootstrapDynamicTypes = (allCtorCandidates: unknown[]) => {
    // Limit ourselves to classes that have COSCRAD data type decorators
    const ctorsWithTypeDefinitions = allCtorCandidates.filter(
        (input) => !isNullOrUndefined(getCoscradDataSchema(input))
    );

    // Limit metadata updates to classes whose COSCRAD data schemas leverage a union at some depth
    const ctorsThatLeverageAUnionType = ctorsWithTypeDefinitions.filter((ctor) =>
        leveragesUniontype(getCoscradDataSchema(ctor))
    );

    /**
     * Now we iterate through all classes leveraging COSCRAD unions,
     * writing the schemas for each union property.
     */
    ctorsThatLeverageAUnionType.forEach((ctor) => {
        const updatedSchema = mixUnionMemberSchemasIntoTypeDefinitionForClass(
            allCtorCandidates,
            getCoscradDataSchema(ctor)
        );

        // @ts-expect-error fix types
        Reflect.defineMetadata(COSCRAD_DATA_TYPE_METADATA, updatedSchema, ctor.prototype);
    });
};
