import { Book } from '../../../../models/book/entities/book.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import bookValidator from '../../../bookValidator';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validBookDTO = getValidEntityInstaceForTest(resourceTypes.book).toDTO();

export const buildBookTestCase = (): DomainModelValidatorTestCase<Book> => ({
    resourceType: resourceTypes.book,
    validator: bookValidator,
    validCases: [
        {
            dto: validBookDTO,
        },
    ],
    invalidCases: [
        {
            description: 'No title is specified for the book',
            invalidDTO: {
                ...validBookDTO,
                title: undefined,
            },
            // TODO compare inner errors as well
            expectedError: new InvalidEntityDTOError(resourceTypes.book, validBookDTO.id),
        },
        {
            description: 'A book with no pages cannot be published',
            invalidDTO: {
                ...validBookDTO,
                published: true,
                pages: [],
            },
            expectedError: new InvalidEntityDTOError(resourceTypes.book, validBookDTO.id),
        },
    ],
});
