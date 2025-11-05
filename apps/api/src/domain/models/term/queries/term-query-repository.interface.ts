import { IMultilingualTextItem, IToken, LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { FetchManyQueryOptions } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { Maybe } from '../../../../lib/types/maybe';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IQueryRepositoryForConnectable } from '../../context/commands/connect-resources-with-note/resources-connected-with-note.event-handler';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { IQueryRepositoryForAttributable } from '../../shared/common-event-handlers/attributor.event-handler';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/tag-added-for-resource.event-handler';
import { CoscradUserWithGroups } from '../../user-management/user/entities/user/coscrad-user-with-groups';

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
// TODO Expose the `FetchManyQueryOptions` to other resourc types so we can extend `IResourceQueryRepository` again.
export interface ITermQueryRepository
    extends IQueryRepositoryForAnnotatable,
        IQueryRepositoryForConnectable,
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAttributable,
        IAccessible,
        IPublishable {
    create(view: TermViewModel): Promise<void>;
    createMany(views: TermViewModel[]): Promise<void>;
    fetchById(id: string, user?: CoscradUserWithGroups): Promise<Maybe<TermViewModel>>;
    fetchMany(options?: FetchManyQueryOptions): Promise<PaginatedResponse<TermViewModel>>;
    count(options?: FetchManyQueryOptions): Promise<number>;

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
