import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    IEdgeConnectionContext,
    IMultilingualText,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { AggregateId } from '../../../../../domain/types/AggregateId';
import {
    INoteQueryRepository,
    NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN,
} from '../../repositories/note-query-repository.interface';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';

export interface IResourceConnectionDto {
    noteId: AggregateId;
    otherCompositeIdentifier: ResourceCompositeIdentifier;
    selfContext: IEdgeConnectionContext;
    otherContext: IEdgeConnectionContext;
    // this is the note
    text: IMultilingualText;
    // the front-end doesn't currently use this
    role: typeof EdgeConnectionMemberRole.to | typeof EdgeConnectionMemberRole.from;
}

export interface IQueryRepositoryForConnectable {
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
    createConnection(id: string, dto: IResourceConnectionDto): Promise<void>;
}

@CoscradEventConsumer('RESOURCES_CONNECTED_WITH_NOTE')
export class ResourcesConnectedWithNoteEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN)
        private readonly noteRepository: INoteQueryRepository
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

        await this.noteRepository
            .connectResourcesWithNote(
                {
                    id: noteId,
                    connectionType: EdgeConnectionType.dual,
                    text,
                },
                fromMemberCompositeIdentifier,
                fromMemberContext,
                toMemberCompositeIdentifier,
                toMemberContext
            )
            .catch((e) => {
                throw e;
            });
    }
}
