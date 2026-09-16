import { ICoscradContributorViewModel, PaginatedResponse } from '@coscrad/api-interfaces';
import { FetchManyQueryOptions } from '../../../../../app/domain-modules/web-of-knowledge/interfaces/resource-query-repository.interface';
import { CoscradContributor } from '../entities';

export const COSCRAD_CONTRIBUTOR_QUERY_REPOSITORY_TOKEN =
    'COSCRAD_CONTRIBUTOR_QUERY_REPOSITORY_TOKEN';

export interface ICoscradContributorQueryRepository {
    fetchMultipleById(ids: string[]): Promise<CoscradContributor[]>;

    fetchMany(
        options?: FetchManyQueryOptions
    ): Promise<PaginatedResponse<ICoscradContributorViewModel>>;
}
