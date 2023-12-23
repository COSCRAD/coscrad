import { bootstrapDynamicTypes, getCoscradDataSchema } from '@coscrad/data-types';
import { buildAllDataClassProviders } from '../../../app/controllers/__tests__/createTestModule';
import formatAggregateType from '../../../queries/presentation/formatAggregateType';
import { getAggregateCtor } from '../../factories/utilities/getAggregateCtor';
import { isDiscriminatedUnionResourceType } from '../../factories/utilities/isDiscriminatedUnionResourceType';
import { AggregateType } from '../../types/AggregateType';
import { BibliographicCitationType } from '../bibliographic-citation/types/bibliographic-citation-type';
import { GeometricFeatureType } from '../spatial-feature/types/GeometricFeatureType';

type SubtypesUnion = typeof BibliographicCitationType | typeof GeometricFeatureType;

const buildDescription = (aggregateType: AggregateType, subtype?: SubtypesUnion): string =>
    [
        `the COSCRAD data schema for a`,
        formatAggregateType(aggregateType),
        subtype ? `of subtype: ${subtype}` : ``,
    ].join(' ');

type AggregateTypeAndSubtype = [AggregateType, null | SubtypesUnion];

describe(`Coscrad Data Schemas for aggregate root domain models`, () => {
    beforeAll(() => {
        // TODO Should we import the app module here?
        bootstrapDynamicTypes(buildAllDataClassProviders().map(({ useValue }) => useValue));
    });

    Object.values(AggregateType)
        .flatMap((aggregateType: AggregateType): AggregateTypeAndSubtype[] => {
            if (isDiscriminatedUnionResourceType(aggregateType)) {
                if (aggregateType === AggregateType.bibliographicCitation)
                    return Object.values(BibliographicCitationType).map(
                        (BibliographicCitationType) => [aggregateType, BibliographicCitationType]
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
