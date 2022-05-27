import { MediaItem } from '../../../../models/media-item/entities/media-item.entity';
import { resourceTypes } from '../../../../types/resourceTypes';
import mediaItemValidator from '../../../mediaItemValidator';
import { DomainModelValidatorTestCase } from '../../types/DomainModelValidatorTestCase';
import getValidEntityInstaceForTest from '../utilities/getValidEntityInstaceForTest';

const validDTO = getValidEntityInstaceForTest(resourceTypes.mediaItem).toDTO();

export const buildmediaItemTestCase = (): DomainModelValidatorTestCase<MediaItem> => ({
    resourceType: resourceTypes.mediaItem,
    validator: mediaItemValidator,
    validCases: [
        {
            dto: validDTO,
        },
    ],
    invalidCases: [],
});
