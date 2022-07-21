import { isStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';
import { MediaItem } from '../models/media-item/entities/media-item.entity';
import { AggregateId } from '../types/AggregateId';
import { ResourceType } from '../types/ResourceType';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import MediaItemHasNoTitleInAnyLanguageError from './errors/mediaItem/MediaItemHasNoTitleInAnyLanguageError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import validateSimpleInvariants from './utilities/validateSimpleInvariants';
import { Valid } from './Valid';

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]): InternalError =>
    new InvalidEntityDTOError(ResourceType.mediaItem, id, innerErrors);

const mediaItemValidator: DomainModelValidator = (dto: unknown) => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(ResourceType.mediaItem);

    const { id, title, titleEnglish } = dto as MediaItem;

    // Initialize `allErrors` with simple invariant validation errors

    const allErrors: InternalError[] = validateSimpleInvariants(MediaItem, dto);

    if (!isStringWithNonzeroLength(title) && !isStringWithNonzeroLength(titleEnglish))
        allErrors.push(new MediaItemHasNoTitleInAnyLanguageError(id));

    if (allErrors.length > 0) return buildTopLevelError(id, allErrors);

    return Valid;
};

export default mediaItemValidator;
