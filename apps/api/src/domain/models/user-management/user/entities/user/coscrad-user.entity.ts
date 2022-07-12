import {
    CoscradEnum,
    CoscradUserRole,
    Enum,
    NestedDataType,
    NonEmptyString,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ValidationResult } from '../../../../../../lib/errors/types/ValidationResult';
import { InvariantValidationMethod } from '../../../../../../lib/web-of-knowledge/decorators/invariant-validation-method.decorator';
import { DTO } from '../../../../../../types/DTO';
import InvalidCoscradUserDTOError from '../../../../../domainModelValidators/errors/InvalidCoscradUserDTOError';
import { AggregateType } from '../../../../../types/AggregateType';
import { Aggregate } from '../../../../aggregate.entity';
import validateCoscradUser from '../../invariant-validation/validateCoscradUser';
import { CoscradUserProfile } from './coscrad-user-profile.entity';

@RegisterIndexScopedCommands([])
export class CoscradUser extends Aggregate {
    type = AggregateType.user;

    @NonEmptyString()
    readonly username: string;

    @NestedDataType(CoscradUserProfile)
    readonly profile: CoscradUserProfile;

    @Enum(CoscradEnum.CoscradUserRole, { isArray: true })
    readonly roles: CoscradUserRole[];

    // userData - we may want to store usage data some day- e.g. to store what level the user has completed on a game

    // preferences - we may want to store user-specific preferences some day

    constructor(dto: DTO<CoscradUser>) {
        super(dto);

        if (!dto) return;

        const { profile: profileDto, roles, username } = dto;

        // Note that this is necessary for our simple invariant validation to catch required but missing nested properties
        this.profile = profileDto ? new CoscradUserProfile(profileDto) : undefined;

        this.username = username;

        // Each role is a string, so a shallow clone is effectively deep clone
        this.roles = Array.isArray(roles) ? [...roles] : undefined;
    }

    getAvailableCommands(): string[] {
        return [];
    }

    @InvariantValidationMethod(
        (allErrors: InternalError[], instance: CoscradUser) =>
            new InvalidCoscradUserDTOError(allErrors, instance.id)
    )
    validateInvariants(): ValidationResult {
        return validateCoscradUser(this);
    }
}
