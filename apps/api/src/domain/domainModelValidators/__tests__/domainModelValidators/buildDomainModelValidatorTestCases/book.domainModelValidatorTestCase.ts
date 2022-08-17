import { Book } from '../../../../models/book/entities/book.entity';
import { ResourceType } from '../../../../types/ResourceType';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';
import buildInvariantValidationErrorFactoryFunction from './utils/buildInvariantValidationErrorFactoryFunction';

const resourceType = ResourceType.book;

const validBookDTO = getValidAggregateInstanceForTest(resourceType).toDTO();

const buildTopLevelError = buildInvariantValidationErrorFactoryFunction(resourceType);

export const buildBookTestCase = (): DomainModelValidatorTestCase<Book> => ({
    resourceType: resourceType,
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
            expectedError: buildTopLevelError(validBookDTO.id, []),
        },
        {
            description: 'A book with no pages cannot be published',
            invalidDTO: {
                ...validBookDTO,
                published: true,
                pages: [],
            },
            expectedError: buildTopLevelError(validBookDTO.id, []),
        },
    ],
});
