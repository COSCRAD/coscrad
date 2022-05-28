import { InternalError } from '../../../../../lib/errors/InternalError';
import { MediaItem } from '../../../../models/media-item/entities/media-item.entity';
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
            description: 'the media item has no song in either language',
            invalidDTO: {
                ...validDTO,
                title: undefined,
                titleEnglish: undefined,
            },
            expectedError: buildTopLevelError(validDTO.id, [
                new MediaItemHasNoTitleInAnyLanguageError(validDTO.id),
            ]),
        },
    ],
});
