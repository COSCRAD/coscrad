import { BibliographicReferenceType } from '../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { ResourceType } from '../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../errors/InvalidResourceDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import { buildBookBibliographicReferenceTestCases } from './bibliographicReferenceInvalidTestCases/bookBibliographicReference.domainModelValidatorTestCases';
import { buildJournalArticleBibliographicReferenceTestCases } from './bibliographicReferenceInvalidTestCases/journalArticleBibliographicReference.domainModelValidatorTestCases';
import getValidBibliographicReferenceInstanceForTest from './utils/getValidBibliographicReferenceInstanceForTest';

const validCases = Object.values(BibliographicReferenceType).map((bibliographicReferenceType) => ({
    description: `When bibliographic reference is of type: ${bibliographicReferenceType}`,
    dto: getValidBibliographicReferenceInstanceForTest(bibliographicReferenceType).toDTO(),
}));

const modelSpecificTestCases = [
    ...buildBookBibliographicReferenceTestCases(),
    ...buildJournalArticleBibliographicReferenceTestCases(),
];

export const buildBibliographicReferenceTestCase =
    (): DomainModelValidatorTestCase<ResourceType.bibliographicReference> => ({
        resourceType: ResourceType.bibliographicReference,
        validCases,
        invalidCases: [
            {
                description: 'the dto is undefined',
                invalidDTO: undefined,
                expectedError: new InvalidResourceDTOError(ResourceType.bibliographicReference),
            },
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new InvalidResourceDTOError(ResourceType.bibliographicReference),
            },
            {
                description: 'the dto has an invalid bibliographic reference type',
                invalidDTO: {
                    ...validCases[0].dto,
                    data: {
                        ...validCases[0].dto.data,
                        type: 'BOGUS-BIBLIOGRAPHIC-REFERENCE-TYPE' as BibliographicReferenceType,
                    },
                },
                expectedError: new InvalidResourceDTOError(
                    ResourceType.bibliographicReference,
                    validCases[0].dto.id
                ),
            },
            ...modelSpecificTestCases,
        ],
    });
