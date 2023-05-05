import { ICoscradUserGroupViewModel } from '@coscrad/api-interfaces';
import { FromDomainModel, NestedDataType } from '@coscrad/data-types';
import { CoscradUserGroup } from '../../../domain/models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../../../domain/models/user-management/user/entities/user/coscrad-user.entity';
import { BaseViewModel } from './base.view-model';
import { CoscradUserViewModel } from './coscrad-user.view-model';

const FromUserGroup = FromDomainModel(CoscradUserGroup);

export class CoscradUserGroupViewModel extends BaseViewModel implements ICoscradUserGroupViewModel {
    @FromUserGroup
    readonly label: string;

    @NestedDataType(CoscradUserViewModel, {
        isArray: true,
        label: 'users',
        description: 'all users that are in this group',
    })
    readonly users: CoscradUserViewModel[];

    @FromUserGroup
    readonly description: string;

    constructor(userGroup: CoscradUserGroup, allUsers: CoscradUser[]) {
        super(userGroup);

        const { label, userIds, description } = userGroup;

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
