import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType } from '@coscrad/data-types';
import { ResourceCompositeIdentifier } from '../../../context/commands';

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
