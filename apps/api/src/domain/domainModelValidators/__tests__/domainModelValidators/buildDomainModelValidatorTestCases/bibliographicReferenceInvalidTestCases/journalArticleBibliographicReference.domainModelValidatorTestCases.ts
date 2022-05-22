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
    ];
