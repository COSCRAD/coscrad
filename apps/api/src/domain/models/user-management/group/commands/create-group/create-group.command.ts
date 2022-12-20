import { Command } from '@coscrad/commands';
import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';
import { ICreateCommand } from '../../../../shared/command-handlers/interfaces/create-command.interface';

@Command({
    type: 'CREATE_USER_GROUP',
    label: 'Create User Group',
    description: 'Creates a new user group',
})
export class CreateGroup implements ICreateCommand {
    @UUID({
        label: 'ID (generated)',
        description: 'unique identifier for the new user group',
    })
    readonly id: AggregateId;

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
