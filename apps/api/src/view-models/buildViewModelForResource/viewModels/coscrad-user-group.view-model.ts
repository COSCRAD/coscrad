import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { CoscradUserGroup } from '../../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { BaseViewModel } from './base.view-model';
import { CoscradUserViewModel } from './coscrad-user.view-model';

const FromUserGroup = FromDomainModel(CoscradUserGroup);

export class CoscradUserGroupViewModel extends BaseViewModel {
    @FromUserGroup
    readonly label: string;

    @NestedDataType(CoscradUserViewModel, { isArray: true })
    readonly users: CoscradUserViewModel[];

    @FromUserGroup
    readonly description: string;

    constructor({ id, label, userIds, description }: CoscradUserGroup, allUsers: CoscradUser[]) {
        super({ id });

        this.label = label;

        this.description = description;

        this.users = allUsers.reduce(
            (accumulatedUsers: CoscradUserViewModel[], user) =>
                !userIds.includes(user.id)
                    ? accumulatedUsers
                    : // clone the instance to avoid side-effects
                      [...accumulatedUsers, new CoscradUserViewModel(user)],
            []
        );
    }
}
