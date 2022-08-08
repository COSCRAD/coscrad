import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { isNotFound, NotFound } from '../../../lib/types/not-found';
import { RepositoryProvider } from '../../../persistence/repositories/repository.provider';
import { CoscradUserGroupViewModel } from '../../../view-models/buildViewModelForResource/viewModels/coscrad-user-group.view-model';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { CoscradUserGroup } from '../../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateId } from '../../types/AggregateId';
import { InMemorySnapshot } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';
import { AggregateByIdQueryResult, AggregateIndexQueryResult } from './base-query.service';

export class CoscradUserGroupQueryService {
    private readonly userGroupRepository: IRepositoryForAggregate<CoscradUserGroup>;

    private readonly userRepository: IRepositoryForAggregate<CoscradUser>;

    constructor(
        @Inject(RepositoryProvider) protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {
        this.userGroupRepository = repositoryProvider.getUserGroupRepository();

        this.userRepository = repositoryProvider.getUserRepository();
    }

    async fetchById(
        groupId: AggregateId
    ): Promise<Maybe<AggregateByIdQueryResult<CoscradUserGroupViewModel>>> {
        const [userGroupSearchResult, userSearchResult] = await Promise.all([
            this.userGroupRepository.fetchById(groupId),
            this.userRepository.fetchMany(),
        ]);

        if (isNotFound(userGroupSearchResult)) return NotFound;

        if (isInternalError(userGroupSearchResult)) {
            // Invalid data in DB- system error
            throw userGroupSearchResult;
        }

        const allUsers = userSearchResult.filter(validAggregateOrThrow);

        const externalState = buildInMemorySnapshot({ user: allUsers });

        return this.buildDetailResponse(userGroupSearchResult, externalState);
    }

    async fetchMany(
        specification?: ISpecification<CoscradUserGroup>
    ): Promise<AggregateIndexQueryResult<CoscradUserGroupViewModel>> {
        const [allResults, allUsers] = await Promise.all([
            this.userGroupRepository.fetchMany(specification),
            this.userRepository.fetchMany(),
        ]);

        const externalState: InMemorySnapshot = buildInMemorySnapshot({
            user: allUsers.filter(validAggregateOrThrow),
        });

        const viewModelsAndActions = allResults
            .filter(validAggregateOrThrow)
            .map((userGroup) => this.buildDetailResponse(userGroup, externalState));

        return {
            data: viewModelsAndActions,
            actions: this.commandInfoService.getCommandInfo(CoscradUserGroup),
        };
    }

    private buildDetailResponse(
        userGroup: CoscradUserGroup,
        { user: allUsers }: InMemorySnapshot
    ): AggregateByIdQueryResult<CoscradUserGroupViewModel> {
        return {
            data: new CoscradUserGroupViewModel(userGroup, allUsers),
            actions: this.commandInfoService.getCommandInfo(userGroup),
        };
    }
}
