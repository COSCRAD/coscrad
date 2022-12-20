import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';

@Command({
    type: 'ADD_USER_TO_GROUP',
    label: 'Add User to Group',
    description: 'Add an existing user to an existing user group',
})
export class AddUserToGroup implements ICommand {
    @UUID({
        label: 'group ID',
        description: 'the ID of the group to which the user will be added',
    })
    readonly groupId: AggregateId;

    @UUID({
        label: 'user ID',
        description: 'the ID of the user that will be added to this group',
    })
    readonly userId: AggregateId;
}
