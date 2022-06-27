import { Inject } from '@nestjs/common';
import { RepositoryProvider } from '../../../../persistence/repositories/repository.provider';
import { ResultOrError } from '../../../../types/ResultOrError';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { ResourceType } from '../../../types/ResourceType';
import { Resource } from '../../resource.entity';
import { IEvent } from '../events/interfaces/event.interface';
import { CommandHandlerBase } from './command-handler-base';
import { ICreateCommand } from './interfaces/create-command.interface';

export abstract class BaseCreateCommandHandler<
    TAggregate extends Resource
> extends CommandHandlerBase<TAggregate> {
    constructor(
        protected readonly repositoryProvider: RepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager,
        protected readonly resourceType: ResourceType
    ) {
        super(repositoryProvider, idManager);
    }

    protected abstract createNewInstance(command: ICreateCommand): ResultOrError<TAggregate>;

    protected abstract eventFactory(command: ICreateCommand): Promise<IEvent>;

    protected createOrFetchWriteContext(
        command: ICreateCommand
    ): Promise<ResultOrError<TAggregate>> {
        return Promise.resolve(this.createNewInstance(command));
    }

    /**
     *
     * When handling a `CREATE_X` command, there is no update to the instance.
     */
    protected actOnInstance(instance: TAggregate): ResultOrError<TAggregate> {
        return instance;
    }

    protected async persist(instance: TAggregate, command: ICreateCommand): Promise<void> {
        // generate a unique ID for the event
        // const eventId = await this.idManager.generate();

        // await this.idManager.use(eventId);

        /**
         * This doesn't feel like the right place to do this. Consider tying
         * this in with the `create` method on the repositories.
         */
        await this.idManager.use(command.id);

        const event = await this.eventFactory(command);

        const instanceToPersistWithUpdatedEventHistory = instance.addEventToHistory(
            event
            // new SongCreated(command, eventId)
        );

        // Persist the valid instance
        await this.repositoryProvider
            .forResource(this.resourceType)
            .create(instanceToPersistWithUpdatedEventHistory);
    }
}
