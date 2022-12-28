import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../../../../types/AggregateType';
import { UserCompositeIdentifier } from '../user-composite-identifier';

@Command({
    type: 'REGISTER_USER',
    label: 'Register User',
    description:
        'Register a new COSCRAD user after the user has been registered with the auth provider',
})
export class RegisterUser implements ICommandBase {
    @NestedDataType(UserCompositeIdentifier, {
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
