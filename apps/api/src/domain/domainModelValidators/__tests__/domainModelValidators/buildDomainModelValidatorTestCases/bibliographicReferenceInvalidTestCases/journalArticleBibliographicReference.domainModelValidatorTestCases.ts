import { InternalError } from '../../../../../../lib/errors/InternalError';
import BibliographicReferenceCreator from '../../../../../models/bibliographic-reference/entities/BibliographicReferenceCreator';
import { JournalArticleBibliographicReference } from '../../../../../models/bibliographic-reference/entities/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateId } from '../../../../../types/AggregateId';
import { ResourceType } from '../../../../../types/ResourceType';
import InvalidEntityDTOError from '../../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.journalArticle
);

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(ResourceType.bibliographicReference, id, innerErrors);

export const buildJournalArticleBibliographicReferenceTestCases =
    (): DomainModelValidatorInvalidTestCase<JournalArticleBibliographicReference>[] => [
        {
            description: 'The Journal Article title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    title: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article creators array is empty',
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
            description: 'The Journal Article creators includes a plain string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    creators: ['Jane Deer'] as unknown as BibliographicReferenceCreator[],
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article abstract is an empty string',
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
            description: 'The Journal Article date is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    issueDate: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article publication title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    publicationTitle: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article url is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    url: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article pages is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    pages: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article issn is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    issn: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
        {
            description: 'The Journal Article doi is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    doi: '',
                },
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
