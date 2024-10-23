import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { ResourceCompositeIdentifier } from '../publish-resource';

@Command({
    type: 'DELETE_RESOURCE',
    label: 'Delete Resource',
    description: 'Make a resource invisible to the public',
})
export class DeleteResource implements ICommandBase {
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: ResourceCompositeIdentifier;
}
