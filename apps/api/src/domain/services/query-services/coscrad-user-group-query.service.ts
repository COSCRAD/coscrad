import {
    ICoscradUserGroupViewModel,
    IDetailQueryResult,
    IIndexQueryResult,
} from '@coscrad/api-interfaces';
import { Inject } from '@nestjs/common';
import { CommandInfoService } from '../../../app/controllers/command/services/command-info-service';
import { isInternalError } from '../../../lib/errors/InternalError';
import { Maybe } from '../../../lib/types/maybe';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../persistence/constants/persistenceConstants';
import { CoscradUserGroupViewModel } from '../../../queries/buildViewModelForResource/viewModels/coscrad-user-group.view-model';
import { validAggregateOrThrow } from '../../models/shared/functional';
import { CoscradUserGroup } from '../../models/user-management/group/entities/coscrad-user-group.entity';
import { CoscradUser } from '../../models/user-management/user/entities/user/coscrad-user.entity';
import { IRepositoryForAggregate } from '../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../repositories/interfaces/repository-provider.interface';
import { ISpecification } from '../../repositories/interfaces/specification.interface';
import { AggregateId } from '../../types/AggregateId';
import { InMemorySnapshot } from '../../types/ResourceType';
import buildInMemorySnapshot from '../../utilities/buildInMemorySnapshot';

export class CoscradUserGroupQueryService {
    private readonly userGroupRepository: IRepositoryForAggregate<CoscradUserGroup>;

    private readonly userRepository: IRepositoryForAggregate<CoscradUser>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject(CommandInfoService) protected readonly commandInfoService: CommandInfoService
    ) {
        this.userGroupRepository = repositoryProvider.getUserGroupRepository();

        this.userRepository = repositoryProvider.getUserRepository();
    }

    async fetchById(
        groupId: AggregateId
    ): Promise<Maybe<IDetailQueryResult<ICoscradUserGroupViewModel>>> {
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

        return this.buildDetailResult(userGroupSearchResult, externalState);
    }

    async fetchMany(
        specification?: ISpecification<CoscradUserGroup>
    ): Promise<IIndexQueryResult<ICoscradUserGroupViewModel>> {
        const [allResults, allUsers] = await Promise.all([
            this.userGroupRepository.fetchMany(specification),
            this.userRepository.fetchMany(),
        ]);

        const externalState: InMemorySnapshot = buildInMemorySnapshot({
            user: allUsers.filter(validAggregateOrThrow),
        });

        const viewModelsAndActions = allResults
            .filter(validAggregateOrThrow)
            .map((userGroup) => this.buildDetailResult(userGroup, externalState));

        return {
            entities: viewModelsAndActions,
            indexScopedActions: this.commandInfoService.getCommandForms(CoscradUserGroup),
        };
    }

    private buildDetailResult(
        userGroup: CoscradUserGroup,
        { user: allUsers }: InMemorySnapshot
    ): IDetailQueryResult<CoscradUserGroupViewModel> {
        return {
            ...new CoscradUserGroupViewModel(userGroup, allUsers),
            actions: this.commandInfoService.getCommandForms(userGroup),
        };
    }
}
