import { Command, ICommand } from '@coscrad/commands';
import { CompositeIdentifier, UUID } from '@coscrad/data-types';
import { AggregateId, isAggregateId } from '../../../../types/AggregateId';
import { ResourceCompositeIdentifier } from '../../../../types/ResourceCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';

@Command({
    type: 'GRANT_RESOURCE_READ_ACCESS_TO_USER',
    label: 'Grant Read Access to User',
    description: 'Allow a user to view (but not edit) a given resource',
})
export class GrantResourceReadAccessToUser implements ICommand {
    @UUID({
        label: 'user ID',
        description:
            'unique identifier of the user who will be granted read access to this resource',
    })
    readonly userId: AggregateId;

    @CompositeIdentifier(ResourceType, isAggregateId, {
        label: 'resource composite identifier',
        description:
            'the composite identifier of the resource to which the user will receive access',
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;
}
