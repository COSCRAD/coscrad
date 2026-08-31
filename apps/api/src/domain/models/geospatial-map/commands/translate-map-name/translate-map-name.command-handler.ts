import { ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { GeospatialMap } from '../../geospatial-map.entity';

export class TranslateMapNameCommandHandler extends BaseUpdateCommandHandler<GeospatialMap> {
    protected actOnInstance(
        _instance: GeospatialMap,
        _command: ICommand
    ): ResultOrError<GeospatialMap> {
        throw new Error('Method not implemented.');
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: GeospatialMap,
        _command?: ICommand
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        _payload: ICommand,
        _eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        throw new Error('Method not implemented.');
    }
}
