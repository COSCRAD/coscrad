import { AggregateType, ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, ReferenceTo, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateTypeProperty } from '../aggregate-type-property.decorator';

class ResourceCompositeIdentifier {
    @AggregateTypeProperty(Object.values(ResourceType))
    // TODO be sure to test when an invalid aggregate type comes through
    type: ResourceType;

    // TODO We should have a source of truth for the label \ description here
    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

@Command({
    type: `GRANT_RESOURCE_READ_ACCESS_TO_USER`,
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
