import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { IQueryRepositoryForAnnotatable } from '../../context/commands/create-note-about-resource/note-about-resource-created.event-handler';
import { IAccessible } from '../../shared/common-commands/grant-resource-read-access-to-user/resource-read-access-granted-to-user.event-handler';
import {
    ICountable,
    IPublishable,
} from '../../shared/common-commands/publish-resource/resource-published.event-handler';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { IQueryRepositoryForTaggable } from '../../tag/commands/tag-resource-or-note/resource-or-note-tagged.event-handler';
import { PhotographViewModel } from './photograph.view-model';

export const PHOTOGRAPH_QUERY_REPOSITORY_TOKEN = 'PHOTOGRAPH_QUERY_REPOSITORY_TOKEN';

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `IPhotographViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface IPhotographQueryRepository
    extends IPublishable,
        ICountable,
        IAccessible,
        // TODO name other interfaces similar `IQueryRepositoryForXable`?
        IQueryRepositoryForTaggable,
        IQueryRepositoryForAnnotatable {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PhotographViewModel): Promise<void>;

    createMany(views: PhotographViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PhotographViewModel>>;

    fetchMany(): Promise<PhotographViewModel[]>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(photographId: AggregateId, event: BaseEvent): Promise<void>;
}
