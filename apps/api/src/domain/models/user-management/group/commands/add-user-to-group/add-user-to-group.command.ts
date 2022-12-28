import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import { UserGroupCompositeIdentifier } from '../user-group-composite-identifier';

@Command({
    type: 'ADD_USER_TO_GROUP',
    label: 'Add User to Group',
    description: 'Add an existing user to an existing user group',
})
export class AddUserToGroup implements ICommandBase {
    @NestedDataType(UserGroupCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.userGroup
    >;

    @ReferenceTo(AggregateType.user)
    @UUID({
        label: 'user ID',
        description: 'the ID of the user that will be added to this group',
    })
    readonly userId: AggregateId;
}
