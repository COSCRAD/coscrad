import { MIMEType } from '@coscrad/data-types';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { MediaItem } from '../../../../models/media-item/entities/media-item.entity';
import { ContributorAndRole } from '../../../../models/song/ContributorAndRole';
import { AggregateId } from '../../../../types/AggregateId';
import { ResourceType } from '../../../../types/ResourceType';
import InvalidResourceDTOError from '../../../errors/InvalidResourceDTOError';
import MediaItemHasNoTitleInAnyLanguageError from '../../../errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import NullOrUndefinedResourceDTOError from '../../../errors/NullOrUndefinedResourceDTOError';
import mediaItemValidator from '../../../mediaItemValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidAggregateInstanceForTest from '../utilities/getValidAggregateInstanceForTest';

const validDTO = getValidAggregateInstanceForTest(ResourceType.mediaItem).toDTO();

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidResourceDTOError(ResourceType.mediaItem, id, innerErrors);

export const buildmediaItemTestCase = (): DomainModelValidatorTestCase<MediaItem> => ({
    resourceType: ResourceType.mediaItem,
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
            expectedError: new NullOrUndefinedResourceDTOError(ResourceType.mediaItem),
        },
        {
            description: 'the dto is null',
            invalidDTO: null,
            expectedError: new NullOrUndefinedResourceDTOError(ResourceType.mediaItem),
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
                type: ResourceType.book as unknown as typeof ResourceType.mediaItem,
            },
            expectedError: buildTopLevelError(validDTO.id, []),
        },
    ],
});
