import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import BibliographicReferenceCreator from '../../../../../models/bibliographic-reference/common/bibliographic-reference-creator.entity';
import JournalArticleBibliographicReferenceData from '../../../../../models/bibliographic-reference/journal-article-bibliographic-reference/journal-article-bibliographic-reference-data.entity';
import { JournalArticleBibliographicReference } from '../../../../../models/bibliographic-reference/journal-article-bibliographic-reference/journal-article-bibliographic-reference.entity';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { AggregateId } from '../../../../../types/AggregateId';
import { ResourceType } from '../../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../../errors/InvalidResourceDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.journalArticle
);

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidResourceDTOError(ResourceType.bibliographicReference, id, innerErrors);

export const buildJournalArticleBibliographicReferenceTestCases =
    (): DomainModelValidatorInvalidTestCase<JournalArticleBibliographicReference>[] => [
        {
            description: 'The Journal Article title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    title: '',
                    /**
                     * TODO[https://www.pivotaltracker.com/story/show/182823742]
                     * We need to fix the return type of getValidBibliographicReferenceInstanceForTest
                     */
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as unknown as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
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
                } as DTO<JournalArticleBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
