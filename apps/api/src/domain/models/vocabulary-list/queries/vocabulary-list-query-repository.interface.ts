import {
    IDetailQueryResult,
    IMultilingualTextItem,
    IVocabularyListViewModel,
} from '@coscrad/api-interfaces';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { FilterPropertyType } from '../commands';
import { VocabularyListEntryImportItem } from '../entities/vocabulary-list.entity';

export const VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN = 'VOCABULARY_LIST_QUERY_REPOSITORY_TOKEN';

/**
 * TODO Absorb the detail query response piece into the view model interface.
 * However, there may be a case that these interfaces are actually the types
 * of the query response, as they represent the contract with the client. There
 * are cases where the query service is responsible for mapping the view model further,
 * e.g. by appending a base URL or leveraging the media item or user services, for example.
 * We should sort this out before we do a fourth event-sourced query service.
 */
type VocabularyListQueryModel = IDetailQueryResult<IVocabularyListViewModel>;

export interface IVocabularyListQueryRepository {
    fetchById(id: AggregateId): Promise<Maybe<VocabularyListQueryModel>>;

    fetchMany(): Promise<VocabularyListQueryModel[]>;

    count(): Promise<number>;

    create(view: VocabularyListQueryModel): Promise<void>;

    createMany(views: VocabularyListQueryModel[]): Promise<void>;

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
