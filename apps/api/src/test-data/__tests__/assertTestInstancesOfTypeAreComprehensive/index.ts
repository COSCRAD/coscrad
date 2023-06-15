import isContextAllowedForGivenResourceType from '../../../domain/models/allowedContexts/isContextAllowedForGivenResourceType';
import { IBibliographicReference } from '../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { EdgeConnectionMemberRole } from '../../../domain/models/context/edge-connection.entity';
import { EdgeConnectionContextType } from '../../../domain/models/context/types/EdgeConnectionContextType';
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

        const doesMemberWithResourceTypeContextTypeAndRoleExist = (
            targetResourceType: ResourceType,
            targetContextType: string,
            targetRole: EdgeConnectionMemberRole
        ) =>
            allConnectionMembers
                .filter(
                    ({
                        compositeIdentifier: { type: resourceType },
                        context: { type: contextType },
                    }) => resourceType === targetResourceType && contextType === targetContextType
                )
                .some(({ role }) => role === targetRole);

        /**
         * Ensure there is a `self`,`to`, and `from` edge connection instance
         * for each resource type and allowed context type pair.
         */

        Object.values(EdgeConnectionMemberRole).forEach((role) => {
            /**
             * TODO Require there to be one instance with each allowed context type
             * for this resource type.
             */
            const resourceTypeContextTypeCombosWithoutInstanceForThisRole = Object.values(
                ResourceType
            ).flatMap((resourceType) =>
                Object.values(EdgeConnectionContextType)
                    .filter(
                        // the rules for whether an identity context is allowed also depend on to \ from roles so we won't enforce these to
                        (contextType) => contextType !== EdgeConnectionContextType.identity
                    )
                    .filter((contextType) =>
                        isContextAllowedForGivenResourceType(contextType, resourceType)
                    )
                    .flatMap((contextType) =>
                        doesMemberWithResourceTypeContextTypeAndRoleExist(
                            resourceType,
                            contextType,
                            role
                        )
                            ? []
                            : [
                                  {
                                      resourceType,
                                      contextType,
                                  },
                              ]
                    )
            );

            // This format ensures the role is visible if the test fails
            const result = {
                role,
                resourceTypeContextTypeCombosWithoutInstanceForThisRole,
            };

            expect(result).toEqual({
                role,
                resourceTypeContextTypeCombosWithoutInstanceForThisRole: [],
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
