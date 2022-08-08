import { IBibliographicReference } from '../../../domain/models/bibliographic-reference/interfaces/bibliographic-reference.interface';
import { BibliographicReferenceType } from '../../../domain/models/bibliographic-reference/types/BibliographicReferenceType';
import { ISpatialFeature } from '../../../domain/models/spatial-feature/ISpatialFeature';
import { GeometricFeatureType } from '../../../domain/models/spatial-feature/types/GeometricFeatureType';
import { AggregateType } from '../../../domain/types/AggregateType';
import { DeluxInMemoryStore } from '../../../domain/types/DeluxInMemoryStore';
import { Snapshot } from '../../../domain/types/Snapshot';
import { isNullOrUndefined } from '../../../domain/utilities/validation/is-null-or-undefined';
import { InternalError } from '../../../lib/errors/InternalError';
import formatAggregateType from '../../../view-models/presentation/formatAggregateType';

type ComprehensiveAssertionFunction = (aggregateType: AggregateType, snapshot: Snapshot) => void;

const defaultComprehensiveAssertionFunction: ComprehensiveAssertionFunction = (
    aggregateType: AggregateType,
    snapshot: Snapshot
) => {
    const instances = new DeluxInMemoryStore(snapshot).fetchAllOfType(aggregateType);

    expect(instances.length).toBeGreaterThan(0);
};

// type SubtypeGetter<T> = (t: T) => string;

// const doesDataIncludeInstanceWithSubtype = <T, U extends string>(
//     data: T[],
//     getSubtype: SubtypeGetter<T>,
//     subtype: U
// ) => data.some((data) => getSubtype(data) === subtype);

const aggregateTypeToComprehensiveAssertionFunction: {
    [K in AggregateType]?: ComprehensiveAssertionFunction;
} = {
    // BibliographicReferenceSubTypes
    [AggregateType.bibliographicReference]: (aggregateType: AggregateType, snapshot: Snapshot) => {
        const subTypesWithNoTestData = Object.values(BibliographicReferenceType).reduce(
            (acc, subtype) => {
                if (
                    !new DeluxInMemoryStore(snapshot)
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
    [AggregateType.spatialFeature]: (aggregateType: AggregateType, snapshot: Snapshot) => {
        const subTypesWithNoTestData = Object.values(GeometricFeatureType).reduce(
            (acc, subtype) => {
                if (
                    !new DeluxInMemoryStore(snapshot)
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
    [AggregateType.note]: (aggregateType: AggregateType, snapshot: Snapshot) => {
        defaultComprehensiveAssertionFunction(aggregateType, snapshot);
    },
    // Tags
    // Categories
};

export default <TAggregateType extends AggregateType>(
    aggregateType: TAggregateType,
    snapshot: Snapshot
) => {
    const specializedComprehensiveAssertionFunction =
        aggregateTypeToComprehensiveAssertionFunction[aggregateType];

    const comprehensiveAssertionFunction = isNullOrUndefined(
        specializedComprehensiveAssertionFunction
    )
        ? defaultComprehensiveAssertionFunction
        : specializedComprehensiveAssertionFunction;

    if (isNullOrUndefined(comprehensiveAssertionFunction)) {
        throw new InternalError(
            `Failed to resolve logic to assert that test data is comprehensive for type: ${formatAggregateType(
                aggregateType
            )}`
        );
    }

    comprehensiveAssertionFunction(aggregateType, snapshot);
};
