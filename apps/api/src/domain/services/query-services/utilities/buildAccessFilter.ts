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
    if (!(userWithGroups instanceof CoscradUserWithGroups)) {
        return (resource: Resource) => resource.published;
    }

    const { roles } = userWithGroups;

    if (!roles) {
        throw new InternalError(`Invalid user with groups encountered: missing roles`);
    }

    if (
        [CoscradUserRole.projectAdmin, CoscradUserRole.superAdmin].some((role) =>
            userWithGroups.roles.includes(role)
        )
    ) {
        return (_: Resource) => true;
    }

    return (resource: Resource) => {
        if (resource.published) return true;

        if (resource.queryAccessControlList.canUser(userWithGroups.id)) return true;

        return userWithGroups.groups.some(({ id: groupId }) =>
            resource.queryAccessControlList.canGroup(groupId)
        );
    };
};
