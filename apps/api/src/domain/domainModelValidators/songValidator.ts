import { isStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';
import { DTO } from '../../types/DTO';
import { Song } from '../models/song/song.entity';
import { EntityId } from '../types/ResourceId';
import { resourceTypes } from '../types/resourceTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidEntityDTOError from './errors/InvalidEntityDTOError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import validateSimpleInvariants from './utilities/validateSimpleInvariants';
import { Valid } from './Valid';

const buildTopLevelError = (id: EntityId, innerErrors: InternalError[]) =>
    new InvalidEntityDTOError(resourceTypes.song, id, innerErrors);

const songValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(resourceTypes.song);

    const allErrors: InternalError[] = [];

    const { id, startMilliseconds, lengthMilliseconds, title, titleEnglish } = dto as DTO<Song>;

    allErrors.push(...validateSimpleInvariants(Song, dto));

    if (startMilliseconds >= lengthMilliseconds)
        allErrors.push(
            new InternalError(
                `the start:${startMilliseconds} cannot be greater than the length:${lengthMilliseconds}`
            )
        );

    if (!isStringWithNonzeroLength(title) && !isStringWithNonzeroLength(titleEnglish))
        allErrors.push(new InternalError('a song must have a title in at least one language'));

    if (allErrors.length > 0) return buildTopLevelError(id, allErrors);

    return Valid;
};

export default songValidator;
