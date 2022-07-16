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
    @UUID()
    readonly id: AggregateId;

    @NonEmptyString()
    readonly label: string;

    @NonEmptyString()
    readonly description: string;
}
