import { ICoscradContributorViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { UserQueryOptions } from '../../../../../app/controllers/resources/term.controller';
import {
    COSCRAD_CONTRIBUTOR_QUERY_REPOSITORY_TOKEN,
    ICoscradContributorQueryRepository,
} from '../interfaces';

export class CoscradContributorQueryService {
    constructor(
        @Inject(COSCRAD_CONTRIBUTOR_QUERY_REPOSITORY_TOKEN)
        protected readonly coscradContributorQueryRepository: ICoscradContributorQueryRepository
    ) {}

    async fetchMany(
        options?: UserQueryOptions
    ): Promise<IIndexQueryResult<ICoscradContributorViewModel>> {
        const { entities, page, count } = await this.coscradContributorQueryRepository.fetchMany({
            ...options,
        });

        return {
            entities: entities.map((e) => {
                const entity = e as unknown as ICoscradContributorViewModel;

                (entity as unknown as ICoscradContributorViewModel).actions = this.fetchUserActions(
                    userWithGroups,
                    [e]
                );

                return entity as ICoscradContributorViewModel;
            }),
            // TODO Should we register index-scoped commands in the view layer instead?
            indexScopedActions: [],
            page,
            count,
        };
    }
}
