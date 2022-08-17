import { InternalError } from '../../lib/errors/InternalError';
import { ResourceType } from '../types/ResourceType';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import NullOrUndefinedAggregateDTOError from './errors/NullOrUndefinedAggregateDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const transcribedAudioValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    // Return early, as we will get null pointers if we proceed
    if (isNullOrUndefined(dto))
        return new NullOrUndefinedAggregateDTOError(ResourceType.transcribedAudio);

    // TODO Add additional logic

    return Valid;
};

export default transcribedAudioValidator;
