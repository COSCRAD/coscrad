import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { Equals } from 'class-validator';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { ICreateCommand } from '../../../../shared/command-handlers/interfaces/create-command.interface';

class UserCompositeId {
    /**
     * This is a bit of a hack. It circumvents our `CoscradDataTypes` and may
     * cause problems for
     * - Schema management
     * - Anyone using our API directly (not via front-end)
     *
     * The simple answer is that you always have to tack on an
     * `aggregateCompositeIdentifier`.
     */
    @Equals(AggregateType.user)
    type = AggregateType.user;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: 'REGISTER_USER',
    label: 'Register User',
    description:
        'Register a new COSCRAD user after the user has been registered with the auth provider',
})
export class RegisterUser implements ICreateCommand {
    @NestedDataType(UserCompositeId, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.user>;

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
