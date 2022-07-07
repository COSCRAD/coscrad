import { InternalError } from '../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../lib/errors/types/ValidationResult';
import InvalidCoscradUserDTOError from '../../../../domainModelValidators/errors/InvalidCoscradUserDTOError';
import NullOrUndefinedCoscradUserDTOError from '../../../../domainModelValidators/errors/user-management/NullOrUndefinedCoscradUserDTOError';
import { DomainModelValidator } from '../../../../domainModelValidators/types/DomainModelValidator';
import validateSimpleInvariants from '../../../../domainModelValidators/utilities/validateSimpleInvariants';
import { Valid } from '../../../../domainModelValidators/Valid';
import { isNullOrUndefined } from '../../../../utilities/validation/is-null-or-undefined';
import { CoscradUser } from '../entities/coscrad-user.entity';

const validateCoscradUser: DomainModelValidator = (dto: unknown): ValidationResult => {
    if (isNullOrUndefined(dto)) return new NullOrUndefinedCoscradUserDTOError();

    const { id } = dto as CoscradUser;

    const allErrors: InternalError[] = [];

    allErrors.push(...validateSimpleInvariants(CoscradUser, dto));

    return allErrors.length > 0 ? new InvalidCoscradUserDTOError(allErrors, id) : Valid;
};

export default validateCoscradUser;
