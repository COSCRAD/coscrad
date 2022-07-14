import { CommandHandler } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../../lib/types/not-available';
import { NotFound } from '../../../../../lib/types/not-found';
import { OK } from '../../../../../lib/types/ok';
import { RepositoryProvider } from '../../../../../persistence/repositories/repository.provider';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildInstanceFactory from '../../../../factories/utilities/buildInstanceFactory';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IUserRepository } from '../../../../repositories/interfaces/user-repository.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import buildInMemorySnapshot from '../../../../utilities/buildInMemorySnapshot';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { CoscradUser } from '../entities/user/coscrad-user.entity';
import { RegisterUser } from './register-user.command';
import { UserRegistered } from './user-registered.event';

@CommandHandler(RegisterUser)
export class RegisterUserCommandHandler extends BaseCreateCommandHandler<CoscradUser> {
    readonly aggregateType = AggregateType.user;

    protected readonly repository: IUserRepository;

    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repository = this.repositoryProvider.getUserRepository();
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
        const userSearchResult = await this.repository.fetchMany();

        const users = userSearchResult.filter(validAggregateOrThrow);

        return buildInMemorySnapshot({ users });
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: CoscradUser
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected async validateAdditionalConstraints({
        id,
    }: RegisterUser): Promise<InternalError | typeof Valid> {
        const idStatus = await this.idManager.status(id);

        if (idStatus === NotAvailable) return new InternalError(`The id ${id} is already in use`);

        if (idStatus === NotFound)
            return new InternalError(`The id ${id} has not been generated with our system`);

        if (idStatus === OK) return Valid;

        const exhaustiveCheck: never = idStatus;

        throw new InternalError(`Invalid status: ${exhaustiveCheck} encountered for id: ${id}`);
    }
}
