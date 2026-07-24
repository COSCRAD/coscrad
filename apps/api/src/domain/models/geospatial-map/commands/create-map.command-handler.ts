import { ICommandBase } from '@coscrad/api-interfaces';
import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../types/ResultOrError';
import { Valid } from '../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../shared/command-handlers/base-create-command-handler';
import { BaseEvent, IEventPayload } from '../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../shared/events/types/EventRecordMetadata';
import { GeospatialMap } from '../geospatial-map.entity';
import { CreateMap } from './create-map.command';

@CommandHandler(CreateMap)
export class CreateMapCommandHandler extends BaseCreateCommandHandler<GeospatialMap> {
    protected createNewInstance(_command: ICommandBase): ResultOrError<GeospatialMap> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: GeospatialMap,
        _command?: ICommand
    ): InternalError | Valid {
        throw new Error('Method not implemented.');
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected buildEvent(
        _payload: ICommand,
        _eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        throw new Error('Method not implemented.');
    }
}
