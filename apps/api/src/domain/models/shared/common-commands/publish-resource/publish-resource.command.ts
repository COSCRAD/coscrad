import { ICommandBase, ResourceType } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { IsEnum } from 'class-validator';
import { AggregateId } from '../../../../types/AggregateId';

class ResourceCompositeIdentifier {
    @IsEnum(ResourceType)
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
