import BookBibliographicReferenceData from '../../../../../../domain/models/bibliographic-reference/entities/BookBibliographicReferenceData';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import BibliographicReferenceCreator from '../../../../../models/bibliographic-reference/entities/BibliographicReferenceCreator';
import { BookBibliographicReference } from '../../../../../models/bibliographic-reference/entities/book-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateId } from '../../../../../types/AggregateId';
import { ResourceType } from '../../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../../errors/InvalidResourceDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.book
).toDTO();

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidResourceDTOError(ResourceType.bibliographicReference, id, innerErrors);

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
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Book contains an element that is a number',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    creators: [88 as unknown as BibliographicReferenceCreator],
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
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
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
