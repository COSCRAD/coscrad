import { Command, ICommand } from '@coscrad/commands';
import { CoscradEnum, CoscradUserRole, Enum, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';

@Command({
    type: 'GRANT_USER_ROLE',
    label: 'Grant User Role',
    description: 'Grant an additional user role to the user',
})
export class GrantUserRole implements ICommand {
    @UUID()
    readonly userId: AggregateId;

    @Enum(CoscradEnum.CoscradUserRole)
    readonly role: CoscradUserRole;
}
