import { InternalError } from '../../../../../lib/errors/InternalError';
import { MediaItem } from '../../../../models/media-item/entities/media-item.entity';
import { MIMEType } from '../../../../models/media-item/types/MIMEType';
import { ContributorAndRole } from '../../../../models/song/ContributorAndRole';
import { EntityId } from '../../../../types/ResourceId';
import { resourceTypes } from '../../../../types/resourceTypes';
import InvalidEntityDTOError from '../../../errors/InvalidEntityDTOError';
import MediaItemHasNoTitleInAnyLanguageError from '../../../errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import NullOrUndefinedResourceDTOError from '../../../errors/NullOrUndefinedResourceDTOError';
import mediaItemValidator from '../../../mediaItemValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.mediaItem).toDTO();

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.mediaItem, id, innerErrors);

export const buildmediaItemTestCase = (): DomainModelValidatorTestCase<MediaItem> => ({
    resourceType: resourceTypes.mediaItem,
    validator: mediaItemValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [
        {
            description: 'the dto is undefined',
            invalidDTO: undefined,
            expectedError: new NullOrUndefinedResourceDTOError(resourceTypes.mediaItem),
        },
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedResourceDTOError(resourceTypes.mediaItem),
        },
        {
            description: 'the media item has no title in either language',
            invalidDTO: {
                ...validDTO,
                title: undefined,
                titleEnglish: undefined,
            },
            expectedError: buildTopLevelError(validDTO.id, [
                new MediaItemHasNoTitleInAnyLanguageError(validDTO.id),
            ]),
        },
        {
            description: 'the MIME type is not in the allowed MIME types list',
            invalidDTO: {
                ...validDTO,
                mimeType: 'audio/BOGUS' as MIMEType,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the title is an empty string',
            invalidDTO: {
                ...validDTO,
                title: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: "the title's English translation is an empty string",
            invalidDTO: {
                ...validDTO,
                titleEnglish: '',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'One of the contributors is a plain number',
            invalidDTO: {
                ...validDTO,
                contributorAndRoles: [
                    {
                        contributorId: '22',
                        role: 'performer',
                    },
                    23 as unknown as ContributorAndRole,
                ],
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the url has an extra . before the TLD',
            invalidDTO: {
                ...validDTO,
                url: 'https://www.songs..org',
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the length is Infinity',
            invalidDTO: {
                ...validDTO,
                lengthMilliseconds: Infinity,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
        {
            description: 'the media item resource type is "book"',
            invalidDTO: {
                ...validDTO,
                type: resourceTypes.book as unknown as typeof resourceTypes.mediaItem,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
    ],
});
