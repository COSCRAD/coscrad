import { ICommandBase, IEdgeConnectionContext, LanguageCode } from '@coscrad/api-interfaces';
import { Command } from '@coscrad/commands';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { LanguageCodeEnum } from '../../../../common/entities/multilingual-text';
import { ContextUnionType } from '../../edge-connection-context-union';
import {
    EdgeConnectionCompositeIdentifier,
    ResourceCompositeIdentifier,
} from '../create-note-about-resource';
import { CONNECT_RESOURCES_WITH_NOTE } from './constants';

@Command({
    type: CONNECT_RESOURCES_WITH_NOTE,
    description: 'connects two resources with a note and context',
    label: 'Connect Resources with Note',
})
export class ConnectResourcesWithNote implements ICommandBase {
    @NestedDataType(EdgeConnectionCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: EdgeConnectionCompositeIdentifier;

    /**
     * To member will be bound to detail view for the resource where we hit the
     * `CONNECT_RESOURCES` button in that flow
     */
    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'to member composite identifier',
        description:
            'system-wide unique identifier for the resource to which you are making a connection',
    })
    readonly toMemberCompositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnionType({
        label: 'to member context',
        description: 'context for the resource to which you are making a connection',
    })
    readonly toMemberContext: IEdgeConnectionContext; // i.e. has a type: EdgeConnectionType property. will be validated by edge connection factory

    @NestedDataType(ResourceCompositeIdentifier, {
        label: 'from member composite identifier',
        description:
            'system-wide unique identifier for the resource from which you are making a connection',
    })
    readonly fromMemberCompositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnionType({
        label: 'from member context',
        description: 'context for the resource from which you are making a connection',
    })
    readonly fromMemberContext: IEdgeConnectionContext;

    @NonEmptyString({
        label: 'text',
        description: 'text for the note',
    })
    text: string;

    @LanguageCodeEnum({
        label: 'language',
        description: 'the language in which you are writing the note',
    })
    languageCode: LanguageCode;
}
