import BookBibliographicReferenceData from '../../../../../../domain/models/bibliographic-reference/entities/BookBibliographicReferenceData';
import { EntityId } from '../../../../../../domain/types/ResourceId';
import { resourceTypes } from '../../../../../../domain/types/resourceTypes';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { BookBibliographicReference } from '../../../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import InvalidEntityDTOError from '../../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(BibliographicReferenceType.book);

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.bibliographicReference, id, innerErrors);

export const buildBookBibliographicReferenceTestCases =
    (): DomainModelValidatorInvalidTestCase<BookBibliographicReference>[] => [
        {
            description: 'The Book title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    title: '',
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book creators array is empty',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    creators: [],
                    // TODO remove cast
                } as unknown as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book abstract is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    abstract: '',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book year is too big',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    year: 2100,
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book publisher is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    publisher: '',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book place is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    place: '',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book url has an invalid protocol',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    url: 'qttps://www.sample.com',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book ISBN includes a letter in place of a numeric character',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    isbn: '978-1-8k5811-34-6',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book number of pages is not a positive integer',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    numberOfPages: -34,
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book number of pages is not a number',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    numberOfPages: '347',
                    // TODO remove cast
                } as unknown as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book number of pages is infinite',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    numberOfPages: Infinity,
                    // TODO remove cast
                } as unknown as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
