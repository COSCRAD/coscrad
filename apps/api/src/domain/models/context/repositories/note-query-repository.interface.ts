import {
    EdgeConnectionType,
    IEdgeConnectionContext,
    IMultilingualText,
    IMultilingualTextItem,
    LanguageCode,
    PaginatedResponse,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { ResultOrError } from '../../../../types/ResultOrError';
import { AggregateId } from '../../../types/AggregateId';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';
import { EventSourcedNoteViewModel } from '../note.view-model.event-sourced';

export const NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN = 'NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface INoteCreationRecord {
    id: AggregateId;

    connectionType: EdgeConnectionType;

    text: IMultilingualText;
}

export interface INoteQueryRepository
    extends IQueryRepositoryForTaggable,
        IPublishable,
        IAccessible {
    fetchById(
        id: AggregateId,
        user?: CoscradUserWithGroups
    ): Promise<ResultOrError<Maybe<EventSourcedNoteViewModel>>>;

    fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<ResultOrError<PaginatedResponse<EventSourcedNoteViewModel>>>;

    createMany(notes: EventSourcedNoteViewModel[]): Promise<void>;

    count(options?: FetchManyQueryOptions): Promise<number>;

    translate(id: string, translationItem: IMultilingualTextItem): Promise<void>;

    addAudio(
        noteId: AggregateId,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): Promise<void>;

    createNoteAbout(
        noteInfo: INoteCreationRecord,
        resourceCompositeIdentifier: ResourceCompositeIdentifier,
        context: IEdgeConnectionContext
    ): Promise<void>;

    connectResourcesWithNote(
        noteInfo: INoteCreationRecord,
        fromMemberCompositeIdentifier: ResourceCompositeIdentifier,
        fromMemberContext: IEdgeConnectionContext,
        toMemberCompositeIdentifier: ResourceCompositeIdentifier,
        toMemberContext: IEdgeConnectionContext
    ): Promise<void>;
}
