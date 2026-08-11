import { ICoscradContributorViewModel, IIndexQueryResult } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { InternalError, isInternalError } from '../../../lib/errors/InternalError';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { CoscradContributorViewModel } from '../../../queries/buildViewModelForResource/viewModels/coscrad-contributor.view-model';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscradContributor } from '../../models/user-management/contributor/entities/coscrad-contributor.entity';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';

export class CoscradContributorQueryService {
    private readonly coscradContributorRepository: IRepositoryForAggregate<CoscradContributor>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    async fetchMany(): Promise<ResultOrError<IIndexQueryResult<ICoscradContributorViewModel>>> {
        const fetchResult = await this.repositoryProvider.getContributorRepository().fetchMany();

        const allErrors = fetchResult.filter(isInternalError);

        if (allErrors.length > 0)
            return new InternalError(`Found one or more invalid contributors: \n`, allErrors);

        const allContributors = fetchResult as CoscradContributor[];

        return {
            entities: allContributors.map((contributor) => ({
                ...cloneToPlainObject(new CoscradContributorViewModel(contributor)),
            })),
            indexScopedActions: [],
            page: 1,
            count: allContributors.length,
        };
    }
}
