import {
    CoscradEnum,
    CoscradUserRole,
    Enum,
    NestedDataType,
    NonEmptyString,
} from '@coscrad/data-types';
import { CoscradUserProfile } from '../../../domain/models/user-management/user/entities/user/coscrad-user-profile.entity';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { BaseViewModel } from './base.view-model';

export class CoscradUserViewModel extends BaseViewModel {
    @NestedDataType(CoscradUserProfile)
    readonly profile: CoscradUserProfile;

    @NonEmptyString()
    readonly username: string;

    @Enum(CoscradEnum.CoscradUserRole, { isArray: true })
    readonly roles: CoscradUserRole[];

    constructor({ id, profile, username, roles }: CoscradUser) {
        super({ id });

        this.profile = new CoscradUserProfile(profile);

        this.username = username;

        // Roles is a `string[]`, so shallow-clone is sufficient to avoid side-effects
        this.roles = [...roles];
    }
}
