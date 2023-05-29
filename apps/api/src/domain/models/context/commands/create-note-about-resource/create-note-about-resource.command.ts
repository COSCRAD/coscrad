import {
    AggregateType,
    ICommandBase,
    IEdgeConnectionContext,
    ResourceType,
} from '@coscrad/api-interfaces';
import { ExternalEnum, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { isResourceCompositeIdentifier } from '../../../../types/ResourceCompositeIdentifier';
import { EdgeConnectionContextType } from '../../types/EdgeConnectionContextType';

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

class ContextBase {
    @ExternalEnum(
        {
            enumName: `EdgeConnectionContextType`,
            enumLabel: 'context type',
            labelsAndValues: [
                { label: EdgeConnectionContextType.freeMultiline, value: 'free multiline' },
                { label: EdgeConnectionContextType.general, value: 'general' },
                { label: EdgeConnectionContextType.identity, value: 'identity' },
                { label: EdgeConnectionContextType.pageRange, value: 'page range' },
                { label: EdgeConnectionContextType.point2D, value: '2D point' },
                { label: EdgeConnectionContextType.textField, value: 'text field' },
                { label: EdgeConnectionContextType.timeRange, value: 'time range' },
            ],
        },
        {
            label: `context`,
            description: `type of context provided for this note`,
        }
    )
    type: EdgeConnectionContextType;
}

export class CreateNoteAboutResource implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: `Composite Identifier`,
        description: `system-wide unique identifier for the edge connection (note) being created`,
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    @NestedDataType(isResourceCompositeIdentifier, {
        label: `CompositeIdentifier`,
        description: `system-wide unique identifier for the resource about which we are making a note`,
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;

    @NestedDataType(ContextBase, {
        label: `context`,
        description: 'context for the note',
    })
    readonly resourceContext: IEdgeConnectionContext;
}
