import {
    EdgeConnectionMemberRole,
    IEdgeConnectionContext,
    IMultilingualText,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import { QUERY_REPOSITORY_PROVIDER_TOKEN } from '../../../shared/common-commands/publish-resource/resource-published.event-handler';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';

// TODO share with API Interfaces?
export interface IResourceConnectionDto {
    noteId: AggregateId;
    compositeIdentifier: ResourceCompositeIdentifier;
    selfContext: IEdgeConnectionContext;
    otherContext: IEdgeConnectionContext;
    // this is the note
    text: IMultilingualText;
    // the front-end doesn't currently use this
    role: EdgeConnectionMemberRole;
}

export interface IQueryRepositoryForConnection {
    /**
     *
     * X toMemberCompositeIdentifier
     * toMemberContext
     *
     * X fromMemberCompositeIdentifier
     * fromMemberContext
     *
     * // note- MultilingualText
     * text: string
     * languageCode: LangaugeCode
     */
    connectResourcesWith(id: string, dto: IResourceConnectionDto): Promise<void>;
}

interface IQueryRepositoryProvider {
    forResource(resourceType: string): IQueryRepositoryForConnection;
}

@CoscradEventConsumer('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourcesConnectedWithNoteEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly repositoryProvider: IQueryRepositoryProvider
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: noteId },
            toMemberCompositeIdentifier,
            toMemberContext,
            fromMemberCompositeIdentifier,
            fromMemberContext,
            text: textForNote,
            languageCode: languageCodeForNote,
        },
    }: ResourcesConnectedWithNote): Promise<void> {
        const text = buildMultilingualTextWithSingleItem(textForNote, languageCodeForNote);

        const role = EdgeConnectionMemberRole.to;

        // TODO can we wrap this in a transaction?

        await this.repositoryProvider
            .forResource(toMemberCompositeIdentifier.type)
            .connectResourcesWith(toMemberCompositeIdentifier.id, {
                noteId,
                selfContext: toMemberContext,
                compositeIdentifier: fromMemberCompositeIdentifier,
                otherContext: fromMemberContext,
                text,
                role,
            });

        await this.repositoryProvider
            .forResource(fromMemberCompositeIdentifier.type)
            .connectResourcesWith(fromMemberCompositeIdentifier.id, {
                noteId,
                selfContext: fromMemberContext,
                compositeIdentifier: toMemberCompositeIdentifier,
                otherContext: toMemberContext,
                text,
                role,
            });
    }
}
