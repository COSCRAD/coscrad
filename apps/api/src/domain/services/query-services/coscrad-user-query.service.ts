import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscradUserViewModel } from '../../../view-models/buildViewModelForResource/viewModels/coscrad-user.view-model';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateByIdQueryResult, AggregateIndexQueryResult } from './base-query.service';

export class CoscradUserQueryService {
    constructor(
        @Inject(RepositoryProvider) protected readonly repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: string
    ): Promise<ResultOrError<Maybe<AggregateByIdQueryResult<CoscradUserViewModel>>>> {
        const searchResult = await this.repositoryProvider.getUserRepository().fetchById(id);

        if (isInternalError(searchResult)) return searchResult;

        if (isNotFound(searchResult)) return searchResult;

        return {
            data: new CoscradUserViewModel(searchResult),
            actions: this.commandInfoService.getCommandInfo(searchResult),
        };
    }

    async fetchMany(
        specification?: ISpecification<CoscradUser>
    ): Promise<AggregateIndexQueryResult<CoscradUserViewModel>> {
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
                data: new CoscradUserViewModel(user),
                actions: this.commandInfoService.getCommandInfo(user),
            }));

        return {
            data: viewModelsAndActions,
            actions: this.commandInfoService.getCommandInfo(CoscradUser),
        };
    }
}
