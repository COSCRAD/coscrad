import { IMultilingualTextItem, LanguageCode } from '@coscrad/api-interfaces';
import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { AggregateId } from '../../../types/AggregateId';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import { IPublishable } from '../../shared/common-commands/publish-resource/resource-published.event-handler';

export const TERM_QUERY_REPOSITORY_TOKEN = 'TERM_QUERY_REPOSITORY_TOKEN';

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `ITermViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface ITermQueryRepository extends IAccessible, IPublishable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: TermViewModel): Promise<void>;

    createMany(views: TermViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<TermViewModel>>;

    fetchMany(): Promise<TermViewModel[]>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    translate(id: AggregateId, translationItem: IMultilingualTextItem): Promise<void>;

    elicitFromPrompt(
        id: AggregateId,
        translationItem: Omit<IMultilingualTextItem, 'role'>
    ): Promise<void>;

    publish(id: AggregateId): Promise<void>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(termId: AggregateId, contributorIds: AggregateId[]): Promise<void>;

    // TODO Is it the ID that we want here or the URL?
    addAudio(id: AggregateId, languageCode: LanguageCode, audioItemId: string): Promise<void>;

    count(): Promise<number>;
}
