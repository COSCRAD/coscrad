import {
    CoscradEnum,
    CoscradUserRole,
    Enum,
    NestedDataType,
    NonEmptyString,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { AggregateType } from '../../../../types/AggregateType';
import { Aggregate } from '../../../aggregate.entity';
import validateCoscradUser from '../invariant-validation/validateCoscradUser';
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

        this.profile = new CoscradUserProfile(profileDto);

        this.username = username;

        // Each role is a string, so a shallow clone is effectively deep clone
        this.roles = [...roles];
    }

    getAvailableCommands(): string[] {
        return [];
    }

    validateInvariants(): ResultOrError<Valid> {
        return validateCoscradUser(this);
    }
}
