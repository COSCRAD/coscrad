import { CoscradUserRole } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Resource } from '../../../models/resource.entity';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';

type ResourceFilter = (resource: Resource) => boolean;

export const buildAccessFilter = (userWithGroups?: CoscradUserWithGroups): ResourceFilter => {
    if (isNullOrUndefined(userWithGroups)) return (resource: Resource) => resource.published;

    if (!(userWithGroups instanceof CoscradUserWithGroups)) {
        throw new InternalError(`Invalid user with groups encountered: ${userWithGroups}`);
    }

    const { roles } = userWithGroups;

    if (!roles) {
        throw new InternalError(`Invalid user with groups encountered: ${userWithGroups.toDTO()}`);
    }

    return userWithGroups.roles.includes(CoscradUserRole.projectAdmin) ||
        userWithGroups.roles.includes(CoscradUserRole.superAdmin)
        ? (_: Resource) => true
        : (resource: Resource) =>
              resource.published ||
              resource.queryAccessControlList.canUser(userWithGroups.id) ||
              userWithGroups.groups.some(({ id: groupId }) =>
                  resource.queryAccessControlList.canGroup(groupId)
              );
};
