import { IDetailQueryResult, IIndexQueryResult } from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscradUserViewModel } from '../../../view-models/buildViewModelForResource/viewModels/coscrad-user.view-model';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ISpecification } from '../../repositories/interfaces/specification.interface';

export class CoscradUserQueryService {
    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: string
    ): Promise<ResultOrError<Maybe<IDetailQueryResult<CoscradUserViewModel>>>> {
        const searchResult = await this.repositoryProvider.getUserRepository().fetchById(id);

        if (isInternalError(searchResult)) return searchResult;

        if (isNotFound(searchResult)) return searchResult;

        return {
            ...new CoscradUserViewModel(searchResult),
            // Only admin users can reach this logic to begin with- no need to filter
            actions: this.commandInfoService.getCommandForms(searchResult),
        };
    }

    async fetchMany(
        specification?: ISpecification<CoscradUser>
    ): Promise<IIndexQueryResult<CoscradUserViewModel>> {
        const allResults = await this.repositoryProvider
            .getUserRepository()
            .fetchMany(specification);

        const viewModelsAndActions = allResults
            .filter((result): result is CoscradUser => {
                if (isInternalError(result)) {
                    throw result;
                }

                return true;
            })
            .map((user) => ({
                ...new CoscradUserViewModel(user),
                actions: this.commandInfoService.getCommandForms(user),
            }));

        return {
            entities: viewModelsAndActions,
            // Only admin users can reach this logic to begin with- no need to filter
            indexScopedActions: this.commandInfoService.getCommandForms(CoscradUser),
        };
    }
}
