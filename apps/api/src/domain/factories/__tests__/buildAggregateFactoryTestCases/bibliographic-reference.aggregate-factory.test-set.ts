import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from '.';
import formatBibliographicReferenceType from '../../../../view-models/presentation/formatBibliographicReferenceType';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateType } from '../../../types/AggregateType';
import getValidBibliographicReferenceInstanceForTest from '../../../__tests__/utilities/getValidBibliographicReferenceInstanceForTest';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import buildValidCasesForSubtypes from './common/buildValidCasesForSubtypes';
import { buildBibliographicReferenceSubtypeFuzzTestCases } from './utilities/buildBibliographicReferenceSubtypeFuzzTestCases';

const aggregateType = AggregateType.bibliographicReference;

const validCases: AggregateFactoryValidTestCase<typeof aggregateType>[] =
    buildValidCasesForSubtypes(
        aggregateType,
        Object.values(BibliographicReferenceType),
        formatBibliographicReferenceType,
        getValidBibliographicReferenceInstanceForTest
    );

const fuzzTestCasesForAllSubtypes = Object.values(BibliographicReferenceType).flatMap(
    (bibliographicReferenceType) =>
        buildBibliographicReferenceSubtypeFuzzTestCases(bibliographicReferenceType)
);

export const buildBibliographicReferenceFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases,
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...fuzzTestCasesForAllSubtypes,
    ],
});
