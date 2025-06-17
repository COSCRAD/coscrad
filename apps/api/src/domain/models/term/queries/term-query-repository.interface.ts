import { IMultilingualTextItem, IToken, LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { AggregateId } from '../../../types/AggregateId';

export const TERM_QUERY_REPOSITORY_TOKEN = 'TERM_QUERY_REPOSITORY_TOKEN';

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `ITermViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface ITermQueryRepository extends IResourceQueryRepository<TermViewModel> {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    translate(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    elicitFromPrompt(
        id: AggregateId,
        translationItem: Omit<IMultilingualTextItem, 'role'>,
        // TODO Should we have a separate `updateTokens` method?
        tokens: IToken[]
    ): Promise<void>;

    // TODO Is it the ID that we want here or the URL?
    addAudio(id: AggregateId, languageCode: LanguageCode, audioItemId: string): Promise<void>;

    indexVocabularyList(id: string, vocabularyListId: string): Promise<void>;

    indexVocabularyLists(termIds: string[], vocabularyListId: string): Promise<void>;
}
