import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { RepositoryProvider } from '../../../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../../../types/DTO';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../../factories/utilities/buildInstanceFactory';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { IUserRepository } from '../../../../../repositories/interfaces/user-repository.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../../shared/functional';
import { CoscradUser } from '../../entities/user/coscrad-user.entity';
import { RegisterUser } from './register-user.command';
import { UserRegistered } from './user-registered.event';

@CommandHandler(RegisterUser)
export class RegisterUserCommandHandler extends BaseCreateCommandHandler<CoscradUser> {
    readonly aggregateType = AggregateType.user;

    protected readonly repositoryForCommandsTargetAggregate: IUserRepository;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate = this.repositoryProvider.getUserRepository();
    }

    protected createNewInstance({
        id,
        userIdFromAuthProvider,
        username,
    }: RegisterUser): ResultOrError<CoscradUser> {
        const createDto: DTO<CoscradUser> = {
            type: AggregateType.user,
            id,
            authProviderUserId: userIdFromAuthProvider,
            username,
            // roles must be registered via a separate command
            roles: [],
            // a profile must be created with a separate command
        };

        return buildInstanceFactory(CoscradUser)(createDto);
    }

    protected eventFactory(command: RegisterUser, eventId: string): BaseEvent {
        return new UserRegistered(command, eventId);
    }

    protected async fetchRequiredExternalState(): Promise<InMemorySnapshot> {
        const userSearchResult = await this.repositoryForCommandsTargetAggregate.fetchMany();

        const users = userSearchResult.filter(validAggregateOrThrow);

        return buildInMemorySnapshot({ users });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradUser
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    // TODO- We should reach out to the auth provider and validate that the user exists there
}
