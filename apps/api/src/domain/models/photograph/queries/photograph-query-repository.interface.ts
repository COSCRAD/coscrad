import { Observable } from 'rxjs';
import { IResourceQueryRepository } from '../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { PhotographViewModel } from './photograph.view-model';

export const PHOTOGRAPH_QUERY_REPOSITORY_TOKEN = 'PHOTOGRAPH_QUERY_REPOSITORY_TOKEN';

/**
 * Note that we are abstracting over the database, not the view model so
 * we program to the concrete view model type. `IPhotographViewModel` is only meant
 * to serve as a constraint for the return of the query service and represents
 * a contract with the client.
 */
export interface IPhotographQueryRepository extends IResourceQueryRepository<PhotographViewModel> {
    subscribeToUpdates(): Observable<{ data: { type: string } }>;

    delete(id: string): Promise<void>;
}
