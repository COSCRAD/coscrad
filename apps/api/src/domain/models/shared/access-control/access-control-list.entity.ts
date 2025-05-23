import { isNonEmptyObject } from '@coscrad/validation-constraints';
import { InternalError } from '../../../../lib/errors/InternalError';
import { DTO } from '../../../../types/DTO';
import { AggregateId } from '../../../types/AggregateId';
import { isNullOrUndefined } from '../../../utilities/validation/is-null-or-undefined';
import BaseDomainModel from '../../base-domain-model.entity';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';

export class AccessControlList extends BaseDomainModel {
    readonly allowedUserIds: AggregateId[];

    readonly allowedGroupIds: AggregateId[];

    /**
     * TODO [https://www.pivotaltracker.com/story/show/181488310]
     * Consider a migration to make this property optional on all
     * resources.
     */
    constructor(dto?: Partial<DTO<AccessControlList>>) {
        super();

        if (isNullOrUndefined(dto)) {
            this.allowedUserIds = [];

            this.allowedGroupIds = [];

            return;
        }

        const { allowedUserIds: allowedUsers, allowedGroupIds: allowedGroups } = dto;

        this.allowedUserIds = isNullOrUndefined(allowedUsers) ? [] : [...allowedUsers];

        this.allowedGroupIds = isNullOrUndefined(allowedGroups) ? [] : [...allowedGroups];
    }

    allowUser(userId: AggregateId): AccessControlList {
        if (this.allowedUserIds.includes(userId)) {
            throw new InternalError(`The user with ID: ${userId} is already allowed`);
        }

        return this.clone<AccessControlList>({
            allowedUserIds: [...this.allowedUserIds, userId],
        });
    }

    allowUsers(userIds: AggregateId[]): AccessControlList {
        userIds.forEach((userId) => this.allowUser(userId));

        return this;
    }

    allowGroup(groupId: AggregateId): AccessControlList {
        if (this.allowedGroupIds.includes(groupId)) {
            throw new InternalError(`The group with ID: ${groupId} is already allowed`);
        }

        return this.clone<AccessControlList>({
            allowedGroupIds: [...this.allowedGroupIds, groupId],
        });
    }

    canUser(userId: AggregateId) {
        return this.allowedUserIds.includes(userId);
    }

    canGroup(groupId: AggregateId) {
        return this.allowedGroupIds.includes(groupId);
    }

    // TODO Should `isPublished` be part of the ACL?!
    canUserWithGroups(userWithGroups: CoscradUserWithGroups) {
        if (!isNonEmptyObject(userWithGroups)) {
            return false;
        }

        if (userWithGroups.isAdmin()) {
            return true;
        }

        const { id: userId, groups } = userWithGroups;

        return this.canUser(userId) || groups.some(({ id: groupId }) => this.canGroup(groupId));
    }
}
