import { CoscradUserRole } from '@coscrad/api-interfaces';
import { InternalError } from '../../../../lib/errors/InternalError';
import { Resource } from '../../../models/resource.entity';
import { CoscradUserWithGroups } from '../../../models/user-management/user/entities/user/coscrad-user-with-groups';

type ResourceFilter = (resource: Resource) => boolean;

/**
 * TODO [https://www.pivotaltracker.com/story/show/184099126]
 * We need a unit test for this.
 */
export const buildAccessFilter = (userWithGroups?: CoscradUserWithGroups): ResourceFilter => {
    if (!(userWithGroups instanceof CoscradUserWithGroups))
        return (resource: Resource) => resource.published;

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
