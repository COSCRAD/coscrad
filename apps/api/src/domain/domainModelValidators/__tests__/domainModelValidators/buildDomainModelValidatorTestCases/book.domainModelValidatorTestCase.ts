import { Book } from '../../../../models/book/entities/book.entity';
import { ResourceType } from '../../../../types/ResourceType';
import bookValidator from '../../../bookValidator';
import InvalidResourceDTOError from '../../../errors/InvalidResourceDTOError';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';

const validBookDTO = getValidAggregateInstanceForTest(ResourceType.book).toDTO();

export const buildBookTestCase = (): DomainModelValidatorTestCase<Book> => ({
    resourceType: ResourceType.book,
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
            expectedError: new InvalidResourceDTOError(ResourceType.book, validBookDTO.id),
        },
        {
            description: 'A book with no pages cannot be published',
            invalidDTO: {
                ...validBookDTO,
                published: true,
                pages: [],
            },
            expectedError: new InvalidResourceDTOError(ResourceType.book, validBookDTO.id),
        },
    ],
});
