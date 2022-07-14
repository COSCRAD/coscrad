import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../factories/utilities/buildInstanceFactory';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IUserRepository } from '../../../../repositories/interfaces/user-repository.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { CoscradUserGroup } from '../entities/coscrad-user-group.entity';
import { CreateGroup } from './create-group.command';
import { GroupCreated } from './group-created.event';

@CommandHandler(CreateGroup)
export class CreateGroupCommandHandler extends BaseCreateCommandHandler<CoscradUserGroup> {
    readonly aggregateType = AggregateType.userGroup;

    // we may want to rename this `repositoryForCommandTargetAggregate`
    protected readonly repository: IRepositoryForAggregate<CoscradUserGroup>;

    protected readonly userRepository: IUserRepository;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repository = repositoryProvider.getUserGroupRepository();

        this.userRepository = repositoryProvider.getUserRepository();
    }

    protected createNewInstance({
        id,
        label,
        description,
    }: CreateGroup): ResultOrError<CoscradUserGroup> {
        const createDto: DTO<CoscradUserGroup> = {
            type: AggregateType.userGroup,
            id,
            label,
            description,
            // You must run 'ADD_USER_TO_GROUP' to add users
            userIds: [],
        };

        return buildInstanceFactory(CoscradUserGroup)(createDto);
    }

    protected eventFactory(command: CreateGroup, eventId: string): BaseEvent {
        return new GroupCreated(command, eventId);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const [existingUserGroupSearchResult, allUserSearchResult] = await Promise.all([
            this.repository.fetchMany(),
            this.userRepository.fetchMany(),
        ]);

        const existingGroups = existingUserGroupSearchResult.filter(validAggregateOrThrow);

        const users = allUserSearchResult.filter(validAggregateOrThrow);

        return buildInMemorySnapshot({
            users,
            userGroups: existingGroups,
        });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradUserGroup
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
}
