import {
    CompositeIdentifier,
    CoscradEnum,
    Enum,
    ExternalEnum,
    NestedDataType,
} from '@coscrad/data-types';
import { RegisterIndexScopedCommands } from '../../../app/controllers/command/command-info/decorators/register-index-scoped-commands.decorator';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import { ValidationResult } from '../../../lib/errors/types/ValidationResult';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { DTO } from '../../../types/DTO';
import { Valid, isValid } from '../../domainModelValidators/Valid';
import validateEdgeConnection from '../../domainModelValidators/contextValidators/validateEdgeConnection';
import { AggregateCompositeIdentifier } from '../../types/AggregateCompositeIdentifier';
import { AggregateType } from '../../types/AggregateType';
import { ResourceCompositeIdentifier } from '../../types/ResourceCompositeIdentifier';
import { InMemorySnapshot, ResourceType, isResourceType } from '../../types/ResourceType';
import BaseDomainModel from '../BaseDomainModel';
import { Aggregate } from '../aggregate.entity';
import { Resource } from '../resource.entity';
import AggregateIdAlreadyInUseError from '../shared/common-command-errors/AggregateIdAlreadyInUseError';
import InvalidExternalStateError from '../shared/common-command-errors/InvalidExternalStateError';
import idEquals from '../shared/functional/idEquals';
import { EdgeConnectionContext } from './context.entity';

export { isEdgeConnectionType } from '@coscrad/api-interfaces';
export { EdgeConnectionMemberRole, EdgeConnectionType, IEdgeConnectionMember };

import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionMember,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { Injectable } from '@nestjs/common';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound } from '../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../types/ResultOrError';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualText } from '../../common/entities/multilingual-text';
import { UpdateMethod } from '../../decorators';
import { AggregateId } from '../../types/AggregateId';
import {
    CreationEventHandlerMap,
    buildAggregateRootFromEventHistory,
} from '../build-aggregate-root-from-event-history';
import AggregateNotFoundError from '../shared/common-command-errors/AggregateNotFoundError';
import { BaseEvent } from '../shared/events/base-event.entity';
import { MultilingualAudio } from '../shared/multilingual-audio/multilingual-audio.entity';
import { AudioAddedForNote, NoteTranslated } from './commands';
import { ResourcesConnectedWithNote } from './commands/connect-resources-with-note/resources-connected-with-note.event';
import { NoteAboutResourceCreated } from './commands/create-note-about-resource/note-about-resource-created.event';
import { ContextUnionType } from './edge-connection-context-union';
import { CannnotAddAudioForNoteInGivenLanguageError } from './errors/cannot-add-audio-for-note-in-given-language.error';

export class EdgeConnectionMember<T extends EdgeConnectionContext = EdgeConnectionContext>
    extends BaseDomainModel
    implements IEdgeConnectionMember
{
    @CompositeIdentifier(ResourceType, isResourceType, {
        label: 'composite identifier',
        description: "composite identifier of the members's resource",
    })
    readonly compositeIdentifier: ResourceCompositeIdentifier;

    @ContextUnionType({
        label: 'context',
        description: 'contextualizes the note or connection for this member',
    })
    context: T;

    @Enum(CoscradEnum.EdgeConnectionMemberRole, {
        label: 'role',
        description: 'is',
    })
    role: EdgeConnectionMemberRole;

    constructor(dto: DTO<EdgeConnectionMember>) {
        super();

        if (!dto) return;

        const { compositeIdentifier, context, role } = dto;

        this.compositeIdentifier = cloneToPlainObject(compositeIdentifier);

        /**
         * TODO Do we need this to be an instance instead of a DTO? If so, we
         * need a context factory.
         */
        this.context = cloneToPlainObject(context);

        this.role = role;
    }
}

@Injectable()
@RegisterIndexScopedCommands([])
export class EdgeConnection extends Aggregate {
    type = AggregateType.note;

    @ExternalEnum(
        {
            enumName: 'EdgeConnectionType',
            enumLabel: 'Edge Connection Type',
            labelsAndValues: [
                {
                    label: 'note',
                    value: EdgeConnectionType.self,
                },
                {
                    label: 'connection',
                    value: EdgeConnectionType.dual,
                },
            ],
        },
        {
            label: 'type',
            description: 'either note or connection',
        }
    )
    connectionType: EdgeConnectionType;

    @NestedDataType(EdgeConnectionMember, {
        isArray: true,
        label: 'members',
        description: 'the resource for the note or the resources involved in the connection',
    })
    readonly members: EdgeConnectionMember[];

    @NestedDataType(MultilingualText, {
        label: 'note text',
        description: 'text summary of why this connection is relevant',
    })
    readonly note: MultilingualText;

    @NestedDataType(MultilingualAudio, {
        label: 'audio for note',
        description: 'contains references to audio for the note',
    })
    audioForNote: MultilingualAudio;

    constructor(dto: DTO<EdgeConnection>) {
        super(dto);

        if (!dto) return;

        const { members, note, connectionType: type, audioForNote: audioForNoteDto } = dto;

        this.connectionType = type;

        this.members = members.map((dto) => new EdgeConnectionMember(dto));

        this.note = new MultilingualText(note);

        this.audioForNote = audioForNoteDto ? new MultilingualAudio(audioForNoteDto) : undefined;
    }

    getName(): MultilingualText {
        if (this.connectionType === EdgeConnectionType.self)
            return buildMultilingualTextWithSingleItem(
                `A note about ${formatAggregateCompositeIdentifier(
                    this.members[0].compositeIdentifier
                )}`
            );

        // We have a dual Edge Connection
        const toMemberCompositeIdentifier = this.members.find(
            ({ role }) => role === EdgeConnectionMemberRole.to
        ).compositeIdentifier;

        const fromMemberCompositeIdentifier = this.members.find(
            ({ role }) => role === EdgeConnectionMemberRole.from
        ).compositeIdentifier;

        return buildMultilingualTextWithSingleItem(
            `A connection from ${formatAggregateCompositeIdentifier(
                fromMemberCompositeIdentifier
            )} to ${formatAggregateCompositeIdentifier(toMemberCompositeIdentifier)}`
        );
    }

    private validateMembersState({ resources }: InMemorySnapshot): InternalError[] {
        return this.members
            .map(({ compositeIdentifier: { type, id }, context }) => ({
                resource:
                    (resources[type] as Resource[]).find((resource) => resource.id === id) ||
                    new AggregateNotFoundError({ type, id }),
                context,
            }))
            .map(({ resource, context }) => {
                if (isInternalError(resource)) return resource;

                return resource.validateContext(context);
            })
            .filter((result): result is InternalError => !isValid(result));
    }

    validateExternalState(externalState: InMemorySnapshot): ValidationResult {
        const { note: connections } = externalState;

        const allErrors: InternalError[] = [];

        if (connections.some(idEquals(this.id)))
            allErrors.push(new AggregateIdAlreadyInUseError(this.getCompositeIdentifier()));

        const inconsistentStateErrorsFromMembers = this.validateMembersState(externalState);

        allErrors.push(...inconsistentStateErrorsFromMembers);

        return allErrors.length > 0 ? new InvalidExternalStateError(allErrors) : Valid;
    }

    protected validateComplexInvariants(): InternalError[] {
        return validateEdgeConnection(this);
    }

    protected getExternalReferences(): AggregateCompositeIdentifier[] {
        return this.members.flatMap(({ compositeIdentifier }) => compositeIdentifier);
    }

    getAvailableCommands(): string[] {
        return [];
    }

    getCompositeIdentifier = () =>
        ({
            type: AggregateType.note,
            id: this.id,
        } as const);

    @UpdateMethod()
    translateNote(
        translationOfNote: string,
        languageCode: LanguageCode
    ): ResultOrError<EdgeConnection> {
        return this.translateMultilingualTextProperty('note', {
            text: translationOfNote,
            languageCode,
            role: MultilingualTextItemRole.freeTranslation,
        });
    }

    @UpdateMethod()
    addAudioForNote(
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): ResultOrError<EdgeConnection> {
        if (!this.note.has(languageCode)) {
            return new CannnotAddAudioForNoteInGivenLanguageError(
                this.id,
                audioItemId,
                languageCode
            );
        }

        const updatedAudio = this.audioForNote.addAudio(audioItemId, languageCode);

        // TODO remove cast
        this.audioForNote = updatedAudio as MultilingualAudio;

        return this;
    }

    getMemberWithRole(role: EdgeConnectionMemberRole): Maybe<EdgeConnectionMember> {
        return this.members.find((member) => member.role === role) || NotFound;
    }

    getAudioForNoteInLanguage(languageCode: LanguageCode): Maybe<AggregateId> {
        return this.audioForNote.getIdForAudioIn(languageCode);
    }

    handleNoteTranslated({ payload: { text, languageCode } }: NoteTranslated) {
        return this.translateNote(text, languageCode);
    }

    handleAudioAddedForNote({ payload: { audioItemId, languageCode } }: AudioAddedForNote) {
        return this.addAudioForNote(audioItemId, languageCode);
    }

    static fromEventHistory(
        eventHistory: BaseEvent[],
        targetId: AggregateId
    ): Maybe<ResultOrError<EdgeConnection>> {
        const creationEventHandlerMap: CreationEventHandlerMap<EdgeConnection> = new Map()
            .set(
                'NOTE_ABOUT_RESOURCE_CREATED',
                EdgeConnection.createEdgeConnectionFromNoteAboutResourceCreated
            )
            .set(
                'RESOURCES_CONNECTED_WITH_NOTE',
                EdgeConnection.createEdgeConnectionFromResourcesConnectedWithNote
            );

        return buildAggregateRootFromEventHistory(
            creationEventHandlerMap,
            {
                type: AggregateType.note,
                id: targetId,
            },
            eventHistory
        );
    }

    private static createEdgeConnectionFromNoteAboutResourceCreated({
        payload: {
            aggregateCompositeIdentifier: { id },
            text,
            resourceCompositeIdentifier,
            resourceContext,
            languageCode,
        },
    }: NoteAboutResourceCreated): ResultOrError<EdgeConnection> {
        const buildResult = new EdgeConnection({
            type: AggregateType.note,
            id,
            audioForNote: MultilingualAudio.buildEmpty(),
            /**
             * A "self note" is a note about a resource with context, represented
             * as a self connection back to the resource node in the graph.
             */
            connectionType: EdgeConnectionType.self,
            note: buildMultilingualTextWithSingleItem(text, languageCode),
            members: [
                // a self-connection has one member, the subject of the note
                new EdgeConnectionMember({
                    compositeIdentifier: resourceCompositeIdentifier,
                    // TODO Use the context union factory
                    context: resourceContext,
                    role: EdgeConnectionMemberRole.self,
                }),
            ],
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                'Failed to event source Edge Connection due to invalid existing state',
                [invariantValidationResult]
            );
        }

        return buildResult;
    }

    private static createEdgeConnectionFromResourcesConnectedWithNote({
        payload: {
            aggregateCompositeIdentifier: { id },
            text,
            languageCode,
            fromMemberCompositeIdentifier,
            fromMemberContext,
            toMemberCompositeIdentifier,
            toMemberContext,
        },
    }: ResourcesConnectedWithNote): ResultOrError<EdgeConnection> {
        const buildResult = new EdgeConnection({
            type: AggregateType.note,
            id,
            audioForNote: MultilingualAudio.buildEmpty(),
            note: buildMultilingualTextWithSingleItem(text, languageCode),
            connectionType: EdgeConnectionType.dual,
            members: [
                new EdgeConnectionMember({
                    compositeIdentifier: fromMemberCompositeIdentifier,
                    context: fromMemberContext,
                    role: EdgeConnectionMemberRole.from,
                }),
                new EdgeConnectionMember({
                    compositeIdentifier: toMemberCompositeIdentifier,
                    context: toMemberContext,
                    role: EdgeConnectionMemberRole.to,
                }),
            ],
        });

        const invariantValidationResult = buildResult.validateInvariants();

        if (isInternalError(invariantValidationResult)) {
            throw new InternalError(
                'Failed to event source Edge Connection due to invalid existing state',
                [invariantValidationResult]
            );
        }

        return buildResult;
    }
}
