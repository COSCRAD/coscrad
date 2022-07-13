import { CoscradUserGroup } from '../../../group/entities/coscrad-user-group.entity';
import { CoscradUser } from './coscrad-user.entity';

export class CoscradUserWithGroups extends CoscradUser {
    readonly groups: CoscradUserGroup[];

    constructor(user: CoscradUser, userGroups: CoscradUserGroup[]) {
        super(user.toDTO());

        this.groups = userGroups.map((group) => group.clone({}));
    }
}
