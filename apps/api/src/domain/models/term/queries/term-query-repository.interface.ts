import { IMultilingualTextItem, IToken, LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';

export const TERM_QUERY_REPOSITORY_TOKEN = 'TERM_QUERY_REPOSITORY_TOKEN';

// TODO
// interface CoscradQueryParams {
//     limit: number;
// }

export interface AudioCandidatesForTerm {
    term: TermViewModel;
    possibleAudioItems: EventSourcedAudioItemViewModel[];
}

interface PaginatedResponse<T> {
    entities: T[];
    page: number;
    count: number;
}

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `ITermViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface ITermQueryRepository {
    create(view: TermViewModel): Promise<void>;
    createMany(views: TermViewModel[]): Promise<void>;
    fetchById(id: string): Promise<Maybe<TermViewModel>>;
    fetchMany(options?: FetchManyQueryOptions): Promise<PaginatedResponse<TermViewModel>>;

    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: string): Promise<void>;

    translate(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    elicitFromPrompt(
        id: AggregateId,
        translationItem: Omit<IMultilingualTextItem, 'role'>,
        // TODO Should we have a separate `updateTokens` method?
        tokens: IToken[]
    ): Promise<void>;

    // TODO Is it the ID that we want here or the URL?
    addAudio(id: AggregateId, languageCode: LanguageCode, audioItemId: string): Promise<void>;

    addPhotograph(id: AggregateId, photographId: AggregateId);

    addVideo(id: AggregateId, videoId: AggregateId): Promise<void>;

    indexVocabularyList(id: string, vocabularyListId: string): Promise<void>;

    indexVocabularyLists(termIds: string[], vocabularyListId: string): Promise<void>;

    // read query methods
    discoverAudio(): Promise<AudioCandidatesForTerm[]>;
}
