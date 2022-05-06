import { InternalError } from '../../lib/errors/InternalError';
import isStringWithNonzeroLength from '../../lib/utilities/isStringWithNonzeroLength';
import { DTO } from '../../types/DTO';
import { Song } from '../models/song/song.entity';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const songValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    // if (isNullOrUndefined(dto))
    // return new NullOrUndefinedResourceDTOError(resourceTypes.song);
    const { audioURL } = dto as DTO<Song>;
    if (!isStringWithNonzeroLength(audioURL))
        return new InternalError('audioURL must be a string with non zero length');
    return Valid;
};

export default songValidator;
