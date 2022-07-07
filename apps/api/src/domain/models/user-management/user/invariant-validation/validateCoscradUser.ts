import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import NullOrUndefinedCoscradUserDTOError from '../../../../domainModelValidators/errors/user-management/NullOrUndefinedCoscradUserDTOError';
import { DomainModelValidator } from '../../../../domainModelValidators/types/DomainModelValidator';
import { Valid } from '../../../../domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';

const validateCoscradUser: DomainModelValidator = (dto: unknown): ValidationResult => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedCoscradUserDTOError();

    return Valid;
};

export default validateCoscradUser;
