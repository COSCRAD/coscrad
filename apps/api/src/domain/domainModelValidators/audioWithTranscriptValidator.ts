import { InternalError } from '../../lib/errors/InternalError';
import { entityTypes } from '../types/entityTypes';
import { isNullOrUndefined } from '../utilities/validation/is-null-or-undefined';
import NullOrUndefinedDTOError from './errors/NullOrUndefinedDTOError';
import { DomainModelValidator } from './types/DomainModelValidator';
import { Valid } from './Valid';

const audioWithTranscriptValidator: DomainModelValidator = (
    dto: unknown
): Valid | InternalError => {
    // Return early, as we will get null pointers if we proceed
    if (isNullOrUndefined(dto)) return new NullOrUndefinedDTOError(entityTypes.audioWithTranscript);

    // TODO Add additional logic

    return Valid;
};

export default audioWithTranscriptValidator;
