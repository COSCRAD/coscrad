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
import { CoscradUser } from '../../entities/user/coscrad-user.entity';
import { GrantUserRole } from './grant-user-role.command';
import { UserRoleGranted } from './user-role-granted.event';

@CommandHandler(GrantUserRole)
export class GrantUserRoleCommandHandler extends BaseUpdateCommandHandler<CoscradUser> {
    protected readonly repositoryForCommandsTargetAggregate: IRepositoryForAggregate<CoscradUser>;

    protected readonly aggregateType = AggregateType.user;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.getUserRepository();
    }

    protected actOnInstance(
        user: CoscradUser,
        { role }: GrantUserRole
    ): ResultOrError<CoscradUser> {
        return user.grantRole(role);
    }

    protected fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        return Promise.resolve(buildInMemorySnapshot({}));
    }

    protected validateExternalState(_: InMemorySnapshot, __: CoscradUser): InternalError | Valid {
        /**
         * This command does not depend on external state. The only state requirement
         * is that the `user` with the given `userId` exists. This is checked
         * by `fetchInstanceToUpdate`.
         */
        return Valid;
    }

    protected buildEvent(
        command: GrantUserRole,
        eventId: string,
        systemUserId: AggregateId
    ): BaseEvent {
        return new UserRoleGranted(command, eventId, systemUserId);
    }
}
