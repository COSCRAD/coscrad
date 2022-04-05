import { InternalError } from '../../../../../lib/errors/InternalError';
import { Term } from '../../../../models/term/entities/term.entity';
import { entityTypes } from '../../../../types/entityTypes';
import InvalidTermDTOError from '../../../errors/term/InvalidTermDTOError';
import TermHasNoTextInAnyLanguageError from '../../../errors/term/TermHasNoTextInAnyLanguageError';
import termValidator from '../../../termValidator';
import { DomainModelValidatorTestCase } from '../types/DomainModelValidatorTestCase';

export const buildTermTestCase = (): DomainModelValidatorTestCase<Term> => ({
    entityType: entityTypes.term,
    validator: termValidator,
    validCases: [
        {
            dto: {
                term: 'test term in language',
                termEnglish: 'test term in english',
                id: '123',
                published: true,
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
