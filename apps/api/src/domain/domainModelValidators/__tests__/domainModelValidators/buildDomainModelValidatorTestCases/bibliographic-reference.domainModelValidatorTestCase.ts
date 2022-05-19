import { IBibliographicReference } from '../../../../models/bibliographic-reference/interfaces/IBibliographicReference';
import { BibliographicReferenceType } from '../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { resourceTypes } from '../../../../types/resourceTypes';
import bibliographicReferenceValidator from '../../../bibliographicReferenceValidator';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import { buildBookBibliographicReferenceTestCases } from './bibliographicReferenceInvalidTestCases/bookBibliographicReference.domainModelValidatorTestCases';
import getValidBibliographicReferenceInstanceForTest from './utils/getValidBibliographicReferenceInstanceForTest';

const validCase = {
    description: 'When given a valid book bibliographic reference DTO',
    dto: getValidBibliographicReferenceInstanceForTest(BibliographicReferenceType.book),
};

const modelSpecificTestCases = [...buildBookBibliographicReferenceTestCases()];

export const buildBibliographicReferenceTestCase =
    (): DomainModelValidatorTestCase<IBibliographicReference> => ({
        resourceType: resourceTypes.bibliographicReference,
        validator: bibliographicReferenceValidator,
        validCases: [validCase],
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
                    ...validCase.dto,
                    data: {
                        ...validCase.dto.data,
                        type: 'BOGUS-BIBLIOGRAPHIC-REFERENCE-TYPE' as BibliographicReferenceType,
                    },
                },
                expectedError: new InvalidEntityDTOError(resourceTypes.bibliographicReference),
            },
            ...modelSpecificTestCases,
        ],
    });
