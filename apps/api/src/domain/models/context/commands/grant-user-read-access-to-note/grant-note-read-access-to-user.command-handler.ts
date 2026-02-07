import { AggregateType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { EdgeConnection } from '../../edge-connection.entity';
import { GrantUserReadAccessToNote } from './grant-note-read-access-to-user.command';
import { NoteReadAccessGrantedToUser } from './note-read-access-granted-to-user.event';

@CommandHandler(GrantUserReadAccessToNote)
export class GrantUserReadAccessToNoteCommandHandler extends BaseUpdateCommandHandler<EdgeConnection> {
    protected async fetchRequiredExternalState(
        command: GrantUserReadAccessToNote
    ): Promise<InMemorySnapshot> {
        const { userId } = command;

        const searchResult = await this.repositoryProvider.getUserRepository().fetchById(userId);

        if (isInternalError(searchResult)) {
            throw new InternalError(
                `Failed to grant read access to ${formatAggregateCompositeIdentifier(
                    command.aggregateCompositeIdentifier
                )}`,
                [searchResult]
            );
        }

        return new DeluxeInMemoryStore({
            user: isNotFound(searchResult) ? [] : [searchResult],
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        instance: EdgeConnection,
        { userId }: GrantUserReadAccessToNote
    ): ResultOrError<EdgeConnection> {
        return instance.grantReadAccessToUser(userId);
    }

    protected validateExternalState(
        { user: users }: InMemorySnapshot,
        _instance: EdgeConnection,
        { userId }: GrantUserReadAccessToNote
    ): Valid | InternalError {
        if (!users.some((user) => user.id === userId)) {
            return new AggregateNotFoundError({
                type: AggregateType.user,
                id: userId,
            });
        }

        return Valid;
    }

    protected buildEvent(
        payload: GrantUserReadAccessToNote,
        eventMeta: EventRecordMetadata
    ): BaseEvent {
        return new NoteReadAccessGrantedToUser(payload, eventMeta);
    }
}
