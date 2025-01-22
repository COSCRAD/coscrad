import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { VocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { AggregateId } from '../../../types/AggregateId';
import { FilterPropertyType } from '../commands';
import { VocabularyListEntryImportItem } from '../entities/vocabulary-list.entity';

export const VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN = 'VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN';

export interface IVocabularyListQueryRepository {
    fetchById(id: AggregateId): Promise<Maybe<VocabularyListViewModel>>;

    fetchMany(): Promise<VocabularyListViewModel[]>;

    count(): Promise<number>;

    create(view: VocabularyListViewModel): Promise<void>;

    createMany(views: VocabularyListViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    // translateName(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    publish(id: AggregateId): Promise<void>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(id: AggregateId, contributorIds: AggregateId[]): Promise<void>;

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
