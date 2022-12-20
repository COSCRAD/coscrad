import { Command, ICommand } from '@coscrad/commands';
import { CoscradEnum, CoscradUserRole, Enum, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';

@Command({
    type: 'GRANT_USER_ROLE',
    label: 'Grant User Role',
    description: 'Grant an additional user role to the user',
})
export class GrantUserRole implements ICommand {
    @UUID({
        label: 'user ID',
        description: 'the ID of the user who will be granted the new role',
    })
    readonly userId: AggregateId;

    @Enum(CoscradEnum.CoscradUserRole, {
        label: 'role',
        description: 'the role that will be granted to this user',
    })
    readonly role: CoscradUserRole;
}
