import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { Equals } from 'class-validator';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { ICreateCommand } from '../../../../shared/command-handlers/interfaces/create-command.interface';

class GroupCompositeId {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.userGroup)
    type = AggregateType.userGroup;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'CREATE_USER_GROUP',
    label: 'Create User Group',
    description: 'Creates a new user group',
})
export class CreateGroup implements ICreateCommand {
    @NestedDataType(GroupCompositeId, {
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
