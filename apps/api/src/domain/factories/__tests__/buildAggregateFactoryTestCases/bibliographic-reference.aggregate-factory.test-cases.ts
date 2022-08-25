import formatBibliographicReferenceType from '../../../../view-models/presentation/formatBibliographicReferenceType';
import getValidBibliographicReferenceInstanceForTest from '../../../domainModelValidators/__tests__/domainModelValidators/buildDomainModelValidatorTestCases/utils/getValidBibliographicReferenceInstanceForTest';
import { BibliographicReferenceType } from '../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateType } from '../../../types/AggregateType';
import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from './';

const aggregateType = AggregateType.bibliographicReference;

const validCases: AggregateFactoryValidTestCase<typeof aggregateType>[] = Object.values(
    BibliographicReferenceType
).map((type) => ({
    description: `valid dto for bibliographic reference of sub-type: ${formatBibliographicReferenceType(
        type
    )}`,
    dto: getValidBibliographicReferenceInstanceForTest(type),
}));

export const buildBibliographicReferenceFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases,
    invalidCases: [],
});
