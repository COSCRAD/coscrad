import { CoscradUserRole } from '@coscrad/data-types';
import { CoscradUserProfile } from '../../../domain/models/user-management/user/entities/coscrad-user-profile.entity';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/coscrad-user.entity';
import { BaseViewModel } from './base.view-model';

export class CoscardUserViewModel extends BaseViewModel {
    readonly profile: CoscradUserProfile;

    readonly username: string;

    readonly roles: CoscradUserRole[];

    constructor({ id, profile, username, roles }: CoscradUser) {
        super({ id });

        this.profile = new CoscradUserProfile(profile);

        this.username = username;

        this.roles = [...roles];
    }
}
