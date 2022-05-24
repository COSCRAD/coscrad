import BookBibliographicReferenceData from 'apps/api/src/domain/models/bibliographic-reference/entities/BookBibliographicReferenceData';
import { DTO } from 'apps/api/src/types/DTO';
import { EntityId } from '../../../../../../domain/types/ResourceId';
import { resourceTypes } from '../../../../../../domain/types/resourceTypes';
import { InternalError } from '../../../../../../lib/errors/InternalError';
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
            description: 'The title is an empty string',
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
            description: 'The creators array is empty',
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
            description: 'The abstract is an empty string',
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
            description: 'The year is too big',
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
            description: 'The publisher is an empty string',
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
            description: 'The place is an empty string',
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
            description: 'The url is an invalid URL',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    url: '',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The ISBN is an invalid ISBN',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    isbn: '',
                    // TODO remove cast
                } as DTO<BookBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The number of pages is not a positive integer',
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
            description: 'The number of pages is not a number',
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
    ];
