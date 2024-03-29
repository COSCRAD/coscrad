import { ICoscradUserViewModel } from '@coscrad/api-interfaces';
import { CoscradUserRole, FromDomainModel } from '@coscrad/data-types';
import { CoscradUserProfile } from '../../../domain/models/user-management/user/entities/user/coscrad-user-profile.entity';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { BaseViewModel } from './base.view-model';

const FromUser = FromDomainModel(CoscradUser);

export class CoscradUserViewModel extends BaseViewModel implements ICoscradUserViewModel {
    @FromUser
    readonly profile: CoscradUserProfile;

    @FromUser
    readonly username: string;

    @FromUser
    readonly roles: CoscradUserRole[];

    constructor(user: CoscradUser) {
        super(user);

        const { profile, username, roles } = user;

        this.profile = new CoscradUserProfile(profile);

        this.username = username;

        // Roles is a `string[]`, so shallow-clone is sufficient to avoid side-effects
        this.roles = [...roles];
    }
}
