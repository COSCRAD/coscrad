import { Command } from '@coscrad/commands';
import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { ICreateCommand } from '../../../shared/command-handlers/interfaces/create-command.interface';

@Command({
    type: 'REGISTER_USER',
    description: 'Registers a new user',
})
export class RegisterUser implements ICreateCommand {
    @UUID()
    readonly id: AggregateId;

    @NonEmptyString()
    userIdFromAuthProvider: string;

    @NonEmptyString()
    username: string;

    // the profile and roles must be set later
}
