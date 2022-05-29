import { isStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { EntityId } from '../types/ResourceId';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import MediaItemHasNoTitleInAnyLanguageError from './errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import validateSimpleInvariants from './utilities/validateSimpleInvariants';
import { Valid } from './Valid';

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(resourceTypes.mediaItem, id, innerErrors);

const mediaItemValidator: DomainModelValidator = (dto: unknown) => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(resourceTypes.mediaItem);

    const { id, title, titleEnglish } = dto as MediaItem;

    // Initialize `allErrors` with simple invariant validation errors

    const allErrors: InternalError[] = validateSimpleInvariants(MediaItem, dto);

    if (!isStringWithNonzeroLength(title) && !isStringWithNonzeroLength(titleEnglish))
        allErrors.push(new MediaItemHasNoTitleInAnyLanguageError(id));

    if (allErrors.length > 0) return buildTopLevelError(id, allErrors);

    return Valid;
};

export default mediaItemValidator;
