import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound } from '../../../lib/types/not-found';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../types/ResultOrError';
import { CoscardUserViewModel } from '../../../view-models/buildViewModelForResource/viewModels/coscrad-user.view-model';
import { CoscradUser } from '../../models/user-management/user/entities/coscrad-user.entity';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateByIdQueryResult, AggregateIndexQueryResult } from './base-query.service';

export class CoscradUserQueryService {
    constructor(
        @Inject(RepositoryProvider) protected readonly repositoryProvider: RepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {}

    async fetchById(
        id: string
    ): Promise<ResultOrError<Maybe<AggregateByIdQueryResult<CoscardUserViewModel>>>> {
        const searchResult = await this.repositoryProvider.getUserRepository().fetchById(id);

        if (isInternalError(searchResult)) return searchResult;

        if (isNotFound(searchResult)) return searchResult;

        return {
            data: new CoscardUserViewModel(searchResult),
            actions: this.commandInfoService.getCommandInfo(searchResult),
        };
    }

    async fetchMany(
        specification?: ISpecification<CoscradUser>
    ): Promise<AggregateIndexQueryResult<CoscardUserViewModel>> {
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
                data: new CoscardUserViewModel(user),
                actions: this.commandInfoService.getCommandInfo(user),
            }));

        return {
            data: viewModelsAndActions,
            actions: this.commandInfoService.getCommandInfo(CoscradUser),
        };
    }
}
