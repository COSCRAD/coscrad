import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { VocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels/vocabulary-list.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';
import { FilterPropertyType } from '../commands';
import { VocabularyListEntryImportItem } from '../entities/vocabulary-list.entity';

export const VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN = 'VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN';

export interface IVocabularyListQueryRepository
    extends IPublishable,
        IAccessible,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAnnotatable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    fetchById(id: AggregateId): Promise<Maybe<VocabularyListViewModel>>;

    fetchMany(): Promise<VocabularyListViewModel[]>;

    count(): Promise<number>;

    create(view: VocabularyListViewModel): Promise<void>;

    createMany(views: VocabularyListViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    // translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(id: AggregateId, event: BaseEvent): Promise<void>;

    translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    registerFilterProperty(
        id: AggregateId,
        name: string,
        type: FilterPropertyType,
        allowedValuesAndLabels: { value: string | boolean; label: string }[]
    ): Promise<void>;

    addTerm(vocabularyListId: AggregateId, termId: AggregateId): Promise<void>;

    analyzeTerm(
        vocabularyListId: AggregateId,
        termId: AggregateId,
        propertyValues: Record<string, string | boolean>
    ): Promise<void>;

    importEntries(
        vocabularyListId: AggregateId,
        entries: VocabularyListEntryImportItem[]
    ): Promise<void>;
}
