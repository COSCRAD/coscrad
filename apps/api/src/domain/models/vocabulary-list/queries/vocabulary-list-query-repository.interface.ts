import { IMultilingualTextItem } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { VocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels/vocabulary-list.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { FilterPropertyType } from '../commands';
import { VocabularyListEntryImportItem } from '../entities/vocabulary-list.entity';

export const VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN = 'VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN';

export interface IVocabularyListQueryRepository
    extends IResourceQueryRepository<VocabularyListViewModel> {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: AggregateId): Promise<void>;

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
