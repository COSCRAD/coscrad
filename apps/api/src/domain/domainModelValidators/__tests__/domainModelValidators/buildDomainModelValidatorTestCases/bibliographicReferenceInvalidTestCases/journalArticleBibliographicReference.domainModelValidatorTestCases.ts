import { InternalError } from '../../../../../../lib/errors/InternalError';
import { DTO } from '../../../../../../types/DTO';
import { JournalArticleBibliographicReference } from '../../../../../models/bibliographic-reference/entities/journalArticle-bibliographic-reference.entity';
import JournalArticleBibliographicReferenceData from '../../../../../models/bibliographic-reference/entities/JournalArticleBibliographicReferenceData';
import { BibliographicReferenceType } from '../../../../../models/bibliographic-reference/types/BibliographicReferenceType';
import { EntityId } from '../../../../../types/ResourceId';
import { resourceTypes } from '../../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../../errors/InvalidEntityDTOError';
import { DomainModelValidatorInvalidTestCase } from '../../../types/DomainModelValidatorTestCase';
import getValidBibliographicReferenceInstanceForTest from '../utils/getValidBibliographicReferenceInstanceForTest';

const validDto = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.journalArticle
);

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.bibliographicReference, id, innerErrors);

export const buildJournalArticleBibliographicReferenceTestCases =
    (): DomainModelValidatorInvalidTestCase<JournalArticleBibliographicReference>[] => [
        {
            description: 'The Journal Article title is an empty string',
            invalidDTO: {
                ...validDto,
                data: {
                    ...validDto.data,
                    title: '',
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
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
                    // TODO remove cast
                } as DTO<JournalArticleBibliographicReferenceData>,
            },
            expectedError: buildTopLevelError(validDto.id, []),
        },
    ];
