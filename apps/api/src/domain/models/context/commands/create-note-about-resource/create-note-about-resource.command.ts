import {
    AggregateType,
    ICommandBase,
    IEdgeConnectionContext,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { ContextUnion } from '../../edge-connection.entity';

export class ResourceCompositeIdentifier {
    // TODO Make this an enum
    @NonEmptyString({
        label: 'type',
        description: 'song',
    })
    // TODO be sure to test when an invalid aggregate type comes through
    type: ResourceType;

    // TODO We should have a source of truth for the label \ description here
    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

export class EdgeConnectionCompositeIdentifier {
    // TODO Use a more restrictive type decorator
    @NonEmptyString({
        label: 'type',
        description: 'song',
    })
    // TODO be sure to test when an invalid aggregate type comes through
    type = AggregateType.note;

    // TODO We should have a source of truth for the label \ description here
    @UUID({
        label: 'ID',
        description: 'unique identifier',
    })
    id: string;
}

export const CREATE_NOTE_ABOUT_RESOURCE = 'CREATE_NOTE_ABOUT_RESOURCE';

@Command({
    type: CREATE_NOTE_ABOUT_RESOURCE,
    description: 'creates a note about this particular resource',
    label: 'Create Note',
})
export class CreateNoteAboutResource implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier for the edge connection (note) being created`,
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @NestedDataType(ResourceCompositeIdentifier, {
        label: `CompositeIdentifier`,
        description: `system-wide unique identifier for the resource about which we are making a note`,
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnion({
        label: 'context for resource',
        description: 'contextualizes the note for the resource',
    })
    readonly resourceContext: IEdgeConnectionContext;

    @NonEmptyString({
        label: 'text',
        description: 'text for the note',
    })
    readonly text: string;

    // TODO Add language code
}
