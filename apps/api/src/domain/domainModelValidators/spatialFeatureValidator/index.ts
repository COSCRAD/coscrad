import { InternalError } from '../../../lib/errors/InternalError';
import { entityTypes } from '../../types/entityTypes';
import { isNullOrUndefined } from '../../utilities/validation/is-null-or-undefined';
import NullOrUndefinedDTOError from '../errors/NullOrUndefinedDTOError';
import { DomainModelValidator } from '../types/DomainModelValidator';
import { Valid } from '../Valid';

const spatialFeatureValidator: DomainModelValidator = (dto: unknown): Valid | InternalError => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedDTOError(entityTypes.spatialFeature);

    return Valid;
};

export default spatialFeatureValidator;
