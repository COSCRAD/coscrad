import { getCoscradDataSchema } from '@coscrad/data-types';
import formatAggregateType from '../../../view-models/presentation/formatAggregateType';
import { getAggregateCtor } from '../../factories/utilities/getAggregateCtor';
import { isDiscriminatedUnionResourceType } from '../../factories/utilities/isDiscriminatedUnionResourceType';
import { AggregateType } from '../../types/AggregateType';
import { BibliographicReferenceType } from '../bibliographic-reference/types/BibliographicReferenceType';
import { GeometricFeatureType } from '../spatial-feature/types/GeometricFeatureType';

type SubtypesUnion = typeof BibliographicReferenceType | typeof GeometricFeatureType;

const buildDescription = (aggregateType: AggregateType, subtype?: SubtypesUnion): string =>
    [
        `the COSCRAD data schema for a`,
        formatAggregateType(aggregateType),
        subtype ? `of subtype: ${subtype}` : ``,
    ].join(' ');

type AggregateTypeAndSubtype = [AggregateType, null | SubtypesUnion];

describe(`Coscrad Data Schemas for aggregate root domain models`, () => {
    Object.values(AggregateType)
        .filter((aggregateType) => aggregateType === AggregateType.bibliographicReference)
        .flatMap((aggregateType: AggregateType): AggregateTypeAndSubtype[] => {
            if (isDiscriminatedUnionResourceType(aggregateType)) {
                if (aggregateType === AggregateType.bibliographicReference)
                    return Object.values(BibliographicReferenceType).map(
                        (bibliographicReferenceType) => [aggregateType, bibliographicReferenceType]
                    ) as unknown as AggregateTypeAndSubtype[];

                if (aggregateType === AggregateType.spatialFeature)
                    return Object.values(GeometricFeatureType).map((geometricFeatureType) => [
                        aggregateType,
                        geometricFeatureType,
                    ]) as unknown as AggregateTypeAndSubtype[];
            }

            // Model has no `subtype` as it is not comprised of a discriminated union
            return [[aggregateType, null]];
        })
        .forEach(([aggregateType, subtype]) =>
            describe(buildDescription(aggregateType, subtype), () => {
                it('should match the snapshot', () => {
                    const Ctor = getAggregateCtor(aggregateType, subtype as unknown as string);

                    const dataSchema = getCoscradDataSchema(Ctor);

                    expect(dataSchema).toMatchSnapshot();
                });
            })
        );
});
