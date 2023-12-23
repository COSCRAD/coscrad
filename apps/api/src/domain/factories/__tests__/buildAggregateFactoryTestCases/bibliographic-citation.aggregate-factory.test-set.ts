import { AggregateFactoryValidTestCase, FactoryTestSuiteForAggregate } from '.';
import formatBibliographicCitationType from '../../../../queries/presentation/formatBibliographicCitationType';
import getValidBibliographicCitationInstanceForTest from '../../../__tests__/utilities/getValidBibliographicCitationInstanceForTest';
import { BibliographicCitationType } from '../../../models/bibliographic-citation/types/bibliographic-citation-type';
import { AggregateType } from '../../../types/AggregateType';
import buildNullAndUndefinedAggregateFactoryInvalidTestCases from './common/buildNullAndUndefinedAggregateFactoryInvalidTestCases';
import buildValidCasesForSubtypes from './common/buildValidCasesForSubtypes';
import { buildBibliographicCitationSubtypeFuzzTestCases } from './utilities/build-bibliographic-citation-subtype-fuzz-test-cases';

const aggregateType = AggregateType.bibliographicCitation;

const validCases: AggregateFactoryValidTestCase<typeof aggregateType>[] =
    buildValidCasesForSubtypes(
        aggregateType,
        Object.values(BibliographicCitationType),
        formatBibliographicCitationType,
        getValidBibliographicCitationInstanceForTest
    );

const fuzzTestCasesForAllSubtypes = Object.values(BibliographicCitationType).flatMap(
    (BibliographicCitationType) =>
        buildBibliographicCitationSubtypeFuzzTestCases(BibliographicCitationType).filter(
            // it's impossible to get an invalid sub-type because the constructor hard-wires this
            ({ description }) => !description.includes('data.type')
        )
);

export const buildBibliographicCitationFactoryTestSet = (): FactoryTestSuiteForAggregate<
    typeof aggregateType
> => ({
    aggregateType,
    validCases,
    invalidCases: [
        ...buildNullAndUndefinedAggregateFactoryInvalidTestCases(aggregateType),
        ...fuzzTestCasesForAllSubtypes,
    ],
});
