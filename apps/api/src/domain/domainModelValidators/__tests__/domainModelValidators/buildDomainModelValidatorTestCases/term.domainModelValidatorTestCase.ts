import { InternalError } from '../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../types/DTO';
import { Term } from '../../../../models/term/entities/term.entity';
import { AggregateId } from '../../../../types/AggregateId';
import { ResourceType } from '../../../../types/ResourceType';
import InvalidTermDTOError from '../../../errors/term/InvalidTermDTOError';
import TermHasNoTextInAnyLanguageError from '../../../errors/term/TermHasNoTextInAnyLanguageError';
import termValidator from '../../../termValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';

const validDTO: DTO<Term> = {
    type: ResourceType.term,
    term: 'test term in language',
    termEnglish: 'test term in english',
    id: '123',
    published: true,
    contributorId: '123',
};

const buildTopLevelError = (termID: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidTermDTOError(termID, innerErrors);

export const buildTermTestCase = (): DomainModelValidatorTestCase<Term> => ({
    resourceType: ResourceType.term,
    validator: termValidator,
    validCases: [
        {
            dto: validDTO,
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
        /**
         * TODO [https://www.pivotaltracker.com/story/show/182217249]
         *
         * Now that the linked story is done, we should refactor this test case
         * to leverage `assertTypeErrorsFromInvalidFuzz`, in order to comprehensively
         * test invalid types for each property. We may want to make
         * this part of a separate test suite. We may want to get away
         * from using a test case builder pattern.
         *  */
        {
            description: 'term is a number',
            invalidDTO: {
                ...validDTO,
                term: 777 as unknown as string,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'termEngish is an array',
            invalidDTO: {
                ...validDTO,
                termEnglish: ['hello world'] as unknown as string,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'audioFilename is an empty string',
            invalidDTO: {
                ...validDTO,
                audioFilename: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
    ],
});
