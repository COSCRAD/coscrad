import {
    EdgeConnectionMemberRole,
    EdgeConnectionType,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { DTO } from '../../../../../types/DTO';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { MultilingualText } from '../../../../common/entities/multilingual-text';
import { Valid } from '../../../../domainModelValidators/Valid';
import buildAggregateFactory from '../../../../factories/buildAggregateFactory';
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
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        toMemberCompositeIdentifier,
        toMemberContext,
        fromMemberCompositeIdentifier,
        fromMemberContext,
        text,
        languageCode,
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
            note: new MultilingualText({
                items: [
                    {
                        text,
                        languageCode,
                        role: MultilingualTextItemRole.original,
                    },
                ],
            }),
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

    protected buildEvent(
        command: ConnectResourcesWithNote,
        eventId: string,
        userId: string
    ): BaseEvent {
        return new ResourcesConnectedWithNote(command, eventId, userId);
    }
}
