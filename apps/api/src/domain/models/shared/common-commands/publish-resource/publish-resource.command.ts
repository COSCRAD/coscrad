import { ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { ExternalEnum, NestedDataType, UUID } from '@coscrad/data-types';
import formatAggregateType from '../../../../../view-models/presentation/formatAggregateType';
import { AggregateId } from '../../../../types/AggregateId';

class ResourceCompositeIdentifier {
    @ExternalEnum(
        {
            enumLabel: 'resource type',
            enumName: 'ResourceType',
            labelsAndValues: Object.values(ResourceType).map((resourceType) => ({
                value: resourceType,
                label: formatAggregateType(resourceType),
            })),
        },
        {
            label: 'resource type',
            description: 'the resource type',
        }
    )
    type: ResourceType;

    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: AggregateId;
}

@Command({
    type: 'PUBLISH_RESOURCE',
    label: 'Publish Resource',
    description: 'Make a resource visible to the public',
})
export class PublishResource implements ICommandBase {
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier;
}
