import { getCoscradDataSchema, validateCoscradModelInstance } from '@coscrad/data-types';
import { InternalError } from '../../../lib/errors/InternalError';
import { DomainModelCtor } from '../../../lib/types/DomainModelCtor';

export default (ResourceCtor: DomainModelCtor, dto: unknown): InternalError[] => {
    const validationErrors = validateCoscradModelInstance(getCoscradDataSchema(ResourceCtor), dto, {
        /**
         * We want to be able to validate an instance as well as a DTO. DTOs that
         * come from the database and existing instances are safe against
         * code injection, as we set `forbidUnknownValues: true` in command payload
         * validation (i.e. prevent unknown values for all user inputs).
         */
        forbidUnknownValues: false,
    });

    return validationErrors.map((error) => new InternalError(error.toString()));
};
