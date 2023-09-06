import {
    getUnionMemberMetadata,
    getUnionMetadata,
    isUnionMemberMetadata,
    isUnionMetadata,
} from '../../decorators';
import { Ctor } from '../getCoscradDataSchemaFromPrototype';

type MembersMap<T = unknown> = Map<string, Ctor<T>>;

export type UnionTypeInfo<T> = {
    discriminantPath: string;
    membersMap: MembersMap<T>;
};

export type UnionTypesMap<T = unknown> = Map<string, UnionTypeInfo<T>>;

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

        const ctorsWithUnionMemberMetadata = allCtorCandidates
            .map(getUnionMemberMetadata)
            .filter(isUnionMemberMetadata);

        const discriminantValuesAndCtors = ctorsWithUnionMemberMetadata
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
