import { IBibliographicReference } from '../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { EdgeConnectionMemberRole } from '../../../domain/models/context/edge-connection.entity';
import { ISpatialFeature } from '../../../domain/models/spatial-feature/interfaces/spatial-feature.interface';
import { GeometricFeatureType } from '../../../domain/models/spatial-feature/types/GeometricFeatureType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DeluxeInMemoryStore } from '../../../domain/types/DeluxeInMemoryStore';
import { ResourceType } from '../../../domain/types/ResourceType';
import { Snapshot } from '../../../domain/types/Snapshot';
import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';

type ComprehensiveAssertionFunction = (aggregateType: AggregateType, snapshot: Snapshot) => void;

const defaultComprehensiveAssertionFunction: ComprehensiveAssertionFunction = (
    aggregateType: AggregateType,
    snapshot: Snapshot
) => {
    const instances = new DeluxeInMemoryStore(snapshot).fetchAllOfType(aggregateType);

    expect(instances.length).toBeGreaterThan(0);
};

/**
 * There is no need to repeat the logic of the `defaultComprehensiveAssertionFunction`
 * here. It will be run for every `AggregateType` independent of the additional
 * logic specified here.
 */
const aggregateTypeToComprehensiveAssertionFunction: {
    [K in AggregateType]?: ComprehensiveAssertionFunction;
} = {
    // BibliographicReferenceSubTypes
    [AggregateType.bibliographicReference]: (_: AggregateType, snapshot: Snapshot) => {
        const subTypesWithNoTestData = Object.values(BibliographicReferenceType).reduce(
            (acc, subtype) => {
                if (
                    !new DeluxeInMemoryStore(snapshot)
                        .fetchAllOfType(AggregateType.bibliographicReference)
                        .some(({ data: { type } }: IBibliographicReference) => type === subtype)
                )
                    return [...acc, subtype];

                return acc;
            },
            []
        );

        expect(subTypesWithNoTestData).toEqual([]);
    },
    // SpatialFeatureSubTypes
    [AggregateType.spatialFeature]: (_: AggregateType, snapshot: Snapshot) => {
        const subTypesWithNoTestData = Object.values(GeometricFeatureType).reduce(
            (acc, subtype) => {
                if (
                    !new DeluxeInMemoryStore(snapshot)
                        .fetchAllOfType(AggregateType.spatialFeature)
                        .some(({ geometry: { type } }: ISpatialFeature) => type === subtype)
                )
                    return [...acc, subtype];

                return acc;
            },
            []
        );

        expect(subTypesWithNoTestData).toEqual([]);
    },
    // EdgeConnection
    [AggregateType.note]: (_: AggregateType, snapshot: Snapshot) => {
        const allConnectionMembers = new DeluxeInMemoryStore(snapshot)
            .fetchAllOfType(AggregateType.note)
            .flatMap(({ members }) => members);

        const doesMemberWithResourceTypeAndRoleExist = (
            targetResourceType: ResourceType,
            targetRole: EdgeConnectionMemberRole
        ) =>
            allConnectionMembers
                .filter(({ compositeIdentifier: { type } }) => type === targetResourceType)
                .some(({ role }) => role === targetRole);

        /**
         * Ensure there is a `self`,`to`, and `from` edge connection instance
         * for each resource type.
         */

        Object.values(EdgeConnectionMemberRole).forEach((role) => {
            const resourceTypesWithNoMemberForThisRole = Object.values(ResourceType).reduce(
                (acc: ResourceType[], resourceType: ResourceType) =>
                    doesMemberWithResourceTypeAndRoleExist(resourceType, role)
                        ? acc
                        : acc.concat(resourceType),
                []
            );

            // This format ensures the role is visible if the test fails
            const result = {
                role,
                resourceTypesWithNoMemberForThisRole,
            };

            expect(result).toEqual({
                role,
                resourceTypesWithNoMemberForThisRole: [],
            });
        });
    },
    // Tags
    [AggregateType.tag]: (_: AggregateType, snapshot) => {
        const allTaggedMembers = new DeluxeInMemoryStore(snapshot)
            .fetchAllOfType(AggregateType.tag)
            .flatMap(({ members }) => members);

        const resourceTypesWithNoTags = Object.values(ResourceType).reduce(
            (acc: ResourceType[], resourceType: ResourceType) => {
                const doesResourceTypeHaveATaggedMember = allTaggedMembers.some(
                    ({ type }) => type === resourceType
                );

                return doesResourceTypeHaveATaggedMember ? acc : acc.concat(resourceType);
            },
            []
        );

        expect(resourceTypesWithNoTags).toEqual([]);
    },
    // Categories
    [AggregateType.category]: (_: AggregateType, snapshot) => {
        const allCategorizedMembers = new DeluxeInMemoryStore(snapshot)
            .fetchAllOfType(AggregateType.category)
            .flatMap(({ members }) => members);

        const resourceTypesWithNoCategorizedInstance = Object.values(ResourceType).reduce(
            (acc: ResourceType[], resourceType: ResourceType) => {
                const doesResourceTypeHaveACategorizedInstance = allCategorizedMembers.some(
                    ({ type }) => type === resourceType
                );

                return doesResourceTypeHaveACategorizedInstance ? acc : acc.concat(resourceType);
            },
            []
        );

        expect(resourceTypesWithNoCategorizedInstance).toEqual([]);
    },
};

export default <TAggregateType extends AggregateType>(
    aggregateType: TAggregateType,
    snapshot: Snapshot
) => {
    /**
     * The default check is that there is at least one instance of the given
     * aggregate type in the snapshot. We want to run this check for every
     * aggregateType.
     */
    defaultComprehensiveAssertionFunction(aggregateType, snapshot);

    // Look for comprehensive checks specific to the `AggregateType`
    const specializedComprehensiveAssertionFunction =
        aggregateTypeToComprehensiveAssertionFunction[aggregateType];

    if (!isNullOrUndefined(specializedComprehensiveAssertionFunction))
        specializedComprehensiveAssertionFunction(aggregateType, snapshot);
};
