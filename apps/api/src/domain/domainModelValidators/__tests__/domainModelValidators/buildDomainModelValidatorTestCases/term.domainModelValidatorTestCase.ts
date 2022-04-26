import { InternalError } from '../../../../../lib/errors/InternalError';
import { Term } from '../../../../models/term/entities/term.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidTermDTOError from '../../../errors/term/InvalidTermDTOError';
import TermHasNoTextInAnyLanguageError from '../../../errors/term/TermHasNoTextInAnyLanguageError';
import termValidator from '../../../termValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';

export const buildTermTestCase = (): DomainModelValidatorTestCase<Term> => ({
    resourceType: resourceTypes.term,
    validator: termValidator,
    validCases: [
        {
            dto: {
                type: resourceTypes.term,
                term: 'test term in language',
                termEnglish: 'test term in english',
                id: '123',
                published: true,
                contributorId: '123',
            },
        },
    ],
    invalidCases: [
        {
            description: 'Both term and termEnglish are empty',
            invalidDTO: {
                id: '123',
            },
            expectedError: new InvalidTermDTOError('123', [
                new TermHasNoTextInAnyLanguageError('123'),
                // Why is casting necessary when this extends `Internal Error`???
            ]) as InternalError,
        },
    ],
});
