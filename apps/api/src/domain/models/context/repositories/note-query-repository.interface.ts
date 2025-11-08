import {
    IMultilingualTextItem,
    LanguageCode,
    PaginatedResponse,
    ResourceCompositeIdentifier,
} from '@coscrad/api-interfaces';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedNoteViewModel } from '../event-sourced-note.view-model';

export const NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN = 'NOTE_QUERY_REPOSITORY_PROVIDER_TOKEN';

export interface INoteQueryRepository {
    fetchById(id: AggregateId): Promise<Maybe<EventSourcedNoteViewModel>>;

    fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<EventSourcedNoteViewModel>>;

    create(note: EventSourcedNoteViewModel): Promise<void>;

    createMany(notes: EventSourcedNoteViewModel[]): Promise<void>;

    count(options?: FetchManyQueryOptions): Promise<number>;

    translate(id: string, translationItem: IMultilingualTextItem): Promise<void>;

    addAudio(
        noteId: AggregateId,
        audioItemId: AggregateId,
        languageCode: LanguageCode
    ): Promise<void>;

    createNoteAbout(
        noteViewModel: EventSourcedNoteViewModel,
        resourceCompositeIdentifier: ResourceCompositeIdentifier
    ): Promise<void>;
}
