import { IBibliographicReference } from '../../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { resourceTypes } from '../../../../types/resourceTypes';
import bibliographicReferenceValidator from '../../../bibliographicReferenceValidator';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
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
    (): DomainModelValidatorTestCase<IBibliographicReference> => ({
        resourceType: resourceTypes.bibliographicReference,
        validator: bibliographicReferenceValidator,
        validCases,
        invalidCases: [
            {
                description: 'the dto is undefined',
                invalidDTO: undefined,
                expectedError: new InvalidEntityDTOError(resourceTypes.bibliographicReference),
            },
            {
                description: 'the dto is null',
                invalidDTO: null,
                expectedError: new InvalidEntityDTOError(resourceTypes.bibliographicReference),
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
                expectedError: new InvalidEntityDTOError(
                    resourceTypes.bibliographicReference,
                    validCases[0].dto.id
                ),
            },
            ...modelSpecificTestCases,
        ],
    });
