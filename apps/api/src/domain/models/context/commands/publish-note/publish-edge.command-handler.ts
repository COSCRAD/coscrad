import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { EdgeConnection } from '../../edge-connection.entity';
import { EdgePublished } from './edge-published.event';
import { PublishEdge } from './publish-edge.command';

@CommandHandler(PublishEdge)
export class PublishEdgeCommandHandler extends BaseUpdateCommandHandler<EdgeConnection> {
    protected async fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        return new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();
    }

    protected actOnInstance(
        instance: EdgeConnection,
        _command: ICommand
    ): ResultOrError<EdgeConnection> {
        return instance.publish();
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: EdgeConnection
    ): Valid | InternalError {
        return Valid;
    }

    protected buildEvent(payload: PublishEdge, eventMeta: EventRecordMetadata): BaseEvent {
        return new EdgePublished(payload, eventMeta);
    }
}
