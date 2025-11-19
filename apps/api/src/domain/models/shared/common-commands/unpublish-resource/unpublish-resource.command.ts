import { ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
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
    type: 'UNPUBLISH_RESOURCE',
    label: 'Unpublish Resource',
    description: 'Make a resource unpublished to the public',
})
export class UnpublishResource implements ICommandBase {
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier;
}
