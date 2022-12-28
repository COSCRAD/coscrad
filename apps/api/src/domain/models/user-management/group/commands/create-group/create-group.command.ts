import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { UserGroupCompositeIdentifier } from '../user-group-composite-identifier';

@Command({
    type: 'CREATE_USER_GROUP',
    label: 'Create User Group',
    description: 'Creates a new user group',
})
export class CreateGroup implements ICommandBase {
    @NestedDataType(UserGroupCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<
        typeof AggregateType.userGroup
    >;

    @NonEmptyString({
        label: 'label',
        description: 'the name of the user group',
    })
    readonly label: string;

    // TODO Consider sharing the annotation with the domain model
    @NonEmptyString({
        label: 'description',
        description: 'a summary of the purpose of this group (what its members have in common)',
    })
    readonly description: string;
}
