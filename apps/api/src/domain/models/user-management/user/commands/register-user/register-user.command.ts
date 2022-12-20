import { Command } from '@coscrad/commands';
import { NonEmptyString, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../types/AggregateId';
import { ICreateCommand } from '../../../../shared/command-handlers/interfaces/create-command.interface';

@Command({
    type: 'REGISTER_USER',
    label: 'Register User',
    description:
        'Register a new COSCRAD user after the user has been registered with the auth provider',
})
export class RegisterUser implements ICreateCommand {
    @UUID({
        label: 'ID (generated)',
        description: 'the internal unique ID of the user to register',
    })
    readonly id: AggregateId;

    @NonEmptyString({
        label: "auth provider's ID",
        description:
            "the auth provider's unique ID for this user (the user must be added to the auth provider first)",
    })
    userIdFromAuthProvider: string;

    @NonEmptyString({
        label: 'username',
        description: 'a human-readable text identifier for this user',
    })
    username: string;

    // the profile and roles must be set later
}
