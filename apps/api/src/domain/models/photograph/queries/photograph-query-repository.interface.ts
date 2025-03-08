import { Observable } from 'rxjs';
import { Maybe } from '../../../../lib/types/maybe';
import { AggregateId } from '../../../types/AggregateId';
import { PhotographViewModel } from './photograph.view-model';

export const PHOTOGRAPH_QUERY_REPOSITORY_TOKEN = 'PHOTOGRAPH_QUERY_REPOSITORY_TOKEN';

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `IPhotographViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface IPhotographQueryRepository {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    create(view: PhotographViewModel): Promise<void>;

    createMany(views: PhotographViewModel[]): Promise<void>;

    delete(id: AggregateId): Promise<void>;

    fetchById(id: AggregateId): Promise<Maybe<PhotographViewModel>>;

    fetchMany(): Promise<PhotographViewModel[]>;

    allowUser(id: AggregateId, userId: AggregateId): Promise<void>;

    publish(id: AggregateId): Promise<void>;

    /**
     * A better approach would be to do this atomically as part of
     * each update query. We need to find a performant and extensible way to
     * do this.
     */
    attribute(photographId: AggregateId, contributorIds: AggregateId[]): Promise<void>;

    count(): Promise<number>;
}
