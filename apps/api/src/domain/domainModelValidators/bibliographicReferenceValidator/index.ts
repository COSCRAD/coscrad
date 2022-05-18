import { InternalError } from '../../../lib/errors/InternalError';
import { DomainModelValidator } from '../types/DomainModelValidator';
import { Valid } from '../Valid';

const bibliographicReferenceValidator: DomainModelValidator = (
    _: unknown
): Valid | InternalError => {
    // TODO implement me and add a test case.
    return Valid;
};

export default bibliographicReferenceValidator;
