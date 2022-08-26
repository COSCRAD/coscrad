import formatBibliographicReferenceType from '../../../../view-models/presentation/formatBibliographicReferenceType';
import getValidBibliographicReferenceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/getValidBibliographicReferenceInstanceForTest';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from './';
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
