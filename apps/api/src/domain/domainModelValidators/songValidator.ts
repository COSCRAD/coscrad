import { isStringWithNonzeroLength } from '@coscrad/validation';
import { InternalError } from '../../lib/errors/InternalError';
import { DTO } from '../../types/DTO';
import { Song } from '../models/song/song.entity';
import { AggregateId } from '../types/AggregateId';
import { ResourceType } from '../types/ResourceType';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import InvalidResourceDTOError from './errors/InvalidResourceDTOError';
import NullOrUndefinedResourceDTOError from './errors/NullOrUndefinedResourceDTOError';
import MissingSongTitleError from './errors/song/MissingSongTitleError';
import { DomainModelValidator } from './types/DomainModelValidator';
import validateSimpleInvariants from './utilities/validateSimpleInvariants';
import { Valid } from './Valid';

const buildTopLevelError = (id: AggregateId, innerErrors: InternalError[]) =>
    new InvalidResourceDTOError(ResourceType.song, id, innerErrors);

const songValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedResourceDTOError(ResourceType.song);

    const allErrors: InternalError[] = [];

    const { id, startMilliseconds, lengthMilliseconds, title, titleEnglish } = dto as DTO<Song>;

    allErrors.push(...validateSimpleInvariants(Song, dto));

    if (startMilliseconds > lengthMilliseconds)
        allErrors.push(
            new InternalError(
                `the start:${startMilliseconds} cannot be greater than the length:${lengthMilliseconds}`
            )
        );

    if (!isStringWithNonzeroLength(title) && !isStringWithNonzeroLength(titleEnglish))
        allErrors.push(new MissingSongTitleError());

    if (allErrors.length > 0) return buildTopLevelError(id, allErrors);

    return Valid;
};

export default songValidator;
