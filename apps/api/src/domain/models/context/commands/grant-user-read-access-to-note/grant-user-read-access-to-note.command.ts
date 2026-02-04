import { ICommandBase } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, UUID } from '@coscrad/data-types';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { EdgeConnectionCompositeIdentifier } from '../create-note-about-resource';

@Command({
    type: 'GRANT_USER_READ_ACCESS_TO_NOTE',
    label: 'Grant Read Access to Note',
    description: 'Allow a user to view (but not edit) a given note',
})
export class GrantUserReadAccessToNote implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'Composite Identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @UUID({
        label: 'userId',
        description: 'the ID of the user who will be given permission to view this note',
    })
    readonly userId: AggregateId;
}
