import { EdgeConnectionMemberRole, EdgeConnectionType } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { Inject } from '@nestjs/common';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildAggregateFactory from '../../../../factories/buildAggregateFactory';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { IRepositoryForAggregate } from '../../../../repositories/interfaces/repository-for-aggregate.interface';
import { IRepositoryProvider } from '../../../../repositories/interfaces/repository-provider.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { Resource } from '../../../resource.entity';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { validAggregateOrThrow } from '../../../shared/functional';
import { EdgeConnection } from '../../edge-connection.entity';
import { ConnectResourcesWithNote } from './connect-resources-with-note.command';
import { ResourcesConnectedWithNote } from './resources-connected-with-note.event';

@CommandHandler(ConnectResourcesWithNote)
export class ConnectResourcesWithNoteCommandHandler extends BaseCreateCommandHandler<EdgeConnection> {
    protected repositoryForCommandsTargetAggregate: IRepositoryForAggregate<EdgeConnection>;

    protected aggregateType: AggregateType = AggregateType.note;

    constructor(
        @Inject(REPOSITORY_PROVIDER_TOKEN)
        protected readonly repositoryProvider: IRepositoryProvider,
        @Inject('ID_MANAGER') protected readonly idManager: IIdManager
    ) {
        super(repositoryProvider, idManager);

        this.repositoryForCommandsTargetAggregate =
            this.repositoryProvider.getEdgeConnectionRepository();
    }

    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        toMemberCompositeIdentifier,
        toMemberContext,
        fromMemberCompositeIdentifier,
        fromMemberContext,
        text,
    }: ConnectResourcesWithNote): ResultOrError<EdgeConnection> {
        /**
         * TODO[https://www.pivotaltracker.com/story/show/185394721]
         * Wrap factory in base create command handler.
         */
        const createDto: DTO<EdgeConnection> = {
            type: AggregateType.note,
            id,
            connectionType: EdgeConnectionType.dual,
            // TODO [https://www.pivotaltracker.com/story/show/185394771] make this Multilingual Text
            note: text,
            members: [
                {
                    role: EdgeConnectionMemberRole.to,
                    compositeIdentifier: toMemberCompositeIdentifier,
                    context: toMemberContext,
                },
                {
                    role: EdgeConnectionMemberRole.from,
                    compositeIdentifier: fromMemberCompositeIdentifier,
                    context: fromMemberContext,
                },
            ],
        };

        return buildAggregateFactory<EdgeConnection>(AggregateType.note)(createDto);
    }

    protected async fetchRequiredExternalState({
        toMemberCompositeIdentifier,
        fromMemberCompositeIdentifier,
    }: ConnectResourcesWithNote): Promise<InMemorySnapshot> {
        const requiredResourceSearchResult = await Promise.all(
            [toMemberCompositeIdentifier, fromMemberCompositeIdentifier].map(
                ({ type: resourceType, id }) =>
                    this.repositoryProvider.forResource(resourceType).fetchById(id)
            )
        );

        const resources = requiredResourceSearchResult
            .filter((resource): resource is ResultOrError<Resource> => !isNotFound(resource))
            .filter(validAggregateOrThrow);

        const snapshot = resources
            .reduce(
                (snapshot, nextResource) =>
                    snapshot.appendAggregates(nextResource.type, [nextResource]),
                new DeluxeInMemoryStore({})
            )
            .fetchFullSnapshotInLegacyFormat();

        return snapshot;
    }

    protected validateExternalState(
        state: InMemorySnapshot,
        instance: EdgeConnection
    ): InternalError | Valid {
        return instance.validateExternalState(state);
    }

    protected buildEvent(command: ICommand, eventId: string, userId: string): BaseEvent {
        return new ResourcesConnectedWithNote(command, eventId, userId);
    }
}
