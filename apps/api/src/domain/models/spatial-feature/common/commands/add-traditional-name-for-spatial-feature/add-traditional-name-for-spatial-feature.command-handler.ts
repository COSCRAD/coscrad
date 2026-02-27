import { ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../../domain/domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../../domain/types/ResourceType';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { BaseEvent } from '../../../../../../queries/event-sourcing';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { SpatialFeatureProperties } from '../../../point/entities/spatial-feature-properties.entity';

export class AddTraditionalNameForSpatialFeatureCommandHandler extends BaseUpdateCommandHandler<SpatialFeatureProperties> {
    protected actOnInstance(
        _instance: SpatialFeatureProperties,
        _command: ICommand
    ): ResultOrError<SpatialFeatureProperties> {
        throw new Error('Method not implemented.');
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: SpatialFeatureProperties,
        _command?: ICommand
    ): Valid | InternalError {
        throw new Error('Method not implemented.');
    }

    protected buildEvent(_payload: ICommand, _eventMeta: EventRecordMetadata): BaseEvent {
        throw new Error('Method not implemented.');
    }
}
