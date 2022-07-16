import { Command, ICommand } from '@coscrad/commands';
import { UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';

@Command({
    type: 'ADD_USER_TO_GROUP',
    label: 'Add User to Group',
    description: 'Add an existing user to an existing user group',
})
export class AddUserToGroup implements ICommand {
    @UUID()
    readonly groupId: AggregateId;

    @UUID()
    readonly userId: AggregateId;
}
