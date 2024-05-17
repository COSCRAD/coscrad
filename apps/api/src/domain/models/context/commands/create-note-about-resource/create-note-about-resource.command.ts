import {
    AggregateType,
    ICommandBase,
    IEdgeConnectionContext,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { FullReference, NestedDataType, NonEmptyString, UUID } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { AggregateTypeProperty } from '../../../shared/common-commands';
import { ContextUnionType } from '../../edge-connection-context-union';

export class ResourceCompositeIdentifier {
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

export class EdgeConnectionCompositeIdentifier {
    @AggregateTypeProperty([AggregateType.note])
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

    @FullReference()
    @NestedDataType(ResourceCompositeIdentifier, {
        label: `CompositeIdentifier`,
        description: `system-wide unique identifier for the resource about which we are making a note`,
    })
    readonly resourceCompositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnionType({
        label: 'context for resource',
        description: 'contextualizes the note for the resource',
    })
    readonly resourceContext: IEdgeConnectionContext;

    @NonEmptyString({
        label: 'text',
        description: 'text for the note',
    })
    readonly text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are writing the note',
    })
    languageCode: LanguageCode;
}
