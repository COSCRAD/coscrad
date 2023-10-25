import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { ResourceCompositeIdentifier } from '../../../context/commands';

@Command({
    type: 'GRANT_RESOURCE_READ_ACCESS_TO_USER',
    label: 'Grant Read Access to User',
    description: 'Allow a user to view (but not edit) a given resource',
})
export class GrantResourceReadAccessToUser implements ICommandBase {
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier;

    @ReferenceTo(AggregateType.user)
    @UUID({
        label: `userId`,
        description: `the ID of the user who will be given permission to view this resource`,
    })
    readonly userId: AggregateId;
}
