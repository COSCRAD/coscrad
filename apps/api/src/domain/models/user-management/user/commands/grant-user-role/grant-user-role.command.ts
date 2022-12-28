import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { CoscradEnum, CoscradUserRole, Enum, NestedDataType } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { UserCompositeIdentifier } from '../user-composite-identifier';

@Command({
    type: 'GRANT_USER_ROLE',
    label: 'Grant User Role',
    description: 'Grant an additional user role to the user',
})
export class GrantUserRole implements ICommandBase {
    @NestedDataType(UserCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.user>;

    @Enum(CoscradEnum.CoscradUserRole, {
        label: 'role',
        description: 'the role that will be granted to this user',
    })
    readonly role: CoscradUserRole;
}
