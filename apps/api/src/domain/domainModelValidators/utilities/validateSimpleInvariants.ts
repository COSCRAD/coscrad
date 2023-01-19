import { getCoscradDataSchema, validateCoscradModelInstance } from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';

export default (ResourceCtor: DomainModelCtor, dto: unknown): InternalError[] => {
    const validationErrors = validateCoscradModelInstance(getCoscradDataSchema(ResourceCtor), dto);

    return validationErrors.map((error) => new InternalError(error.toString()));
};
