import { AggregateType, ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { CompositeIdentifier, NestedDataType } from '@coscrad/data-types';
import { AggregateCompositeIdentifier } from '../../../../types/AggregateCompositeIdentifier';
import { isAggregateId } from '../../../../types/AggregateId';
import { ResourceCompositeIdentifier } from '../../../../types/ResourceCompositeIdentifier';
import { ResourceType } from '../../../../types/ResourceType';
import { UserCompositeIdentifier } from '../../../user-management/user/commands/user-composite-identifier';

@Command({
    type: 'GRANT_RESOURCE_READ_ACCESS_TO_USER',
    label: 'Grant Read Access to User',
    description: 'Allow a user to view (but not edit) a given resource',
})
export class GrantResourceReadAccessToUser implements ICommandBase {
    @NestedDataType(UserCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: AggregateCompositeIdentifier<typeof AggregateType.user>;

    @CompositeIdentifier(ResourceType, isAggregateId, {
        label: 'resource composite identifier',
        description:
            'the composite identifier of the resource to which the user will receive access',
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;
}
