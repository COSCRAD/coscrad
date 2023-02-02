import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../../persistence/constants/persistenceConstants';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../../repositories/interfaces/repository-provider.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { AggregateType } from '../../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { CoscradUserGroup } from '../../entities/coscrad-user-group.entity';
import { AddUserToGroup } from './add-user-to-group.command';
import { UserAddedToGroup } from './user-added-to-group.event';

@CommandHandler(AddUserToGroup)
export class AddUserToGroupCommandHandler extends BaseUpdateCommandHandler<CoscradUserGroup> {
    readonly aggregateType = AggregateType.userGroup;

    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<CoscradUserGroup>;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate =
            this.repositoryProvider.getUserGroupRepository();
    }

    protected actOnInstance(
        instance: CoscradUserGroup,
        { userId }: AddUserToGroup
    ): ResultOrError<CoscradUserGroup> {
        return instance.addUser(userId);
    }

    protected buildEvent(
        command: AddUserToGroup,
        eventId: string,
        systemUserId: AggregateId
    ): BaseEvent {
        return new UserAddedToGroup(command, eventId, systemUserId);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const allUserSearchResult = await this.repositoryProvider.getUserRepository().fetchMany();

        const users = allUserSearchResult.filter(validAggregateOrThrow);

        return buildInMemorySnapshot({
            user: users,
        });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradUserGroup
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }
}
