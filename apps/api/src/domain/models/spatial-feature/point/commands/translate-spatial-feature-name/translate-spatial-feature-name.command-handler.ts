import { CommandHandler, ICommand } from '@coscrad/commands';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../../types/ResultOrError';
import { Valid } from '../../../../../domainModelValidators/Valid';
import { InMemorySnapshot } from '../../../../../types/ResourceType';
import { BaseUpdateCommandHandler } from '../../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../entities/point.entity';
import { TranslateSpatialFeatureName } from './translate-spatial-feature-name.command';

@CommandHandler(TranslateSpatialFeatureName)
export class TranslateSpatialFeatureNameCommandHandler extends BaseUpdateCommandHandler<Point> {
    protected actOnInstance(
        _instance: Point,
        _command: TranslateSpatialFeatureName
    ): ResultOrError<Point> {
        throw new Error('Method not implemented.');
    }

    protected fetchRequiredExternalState(_command?: ICommand): Promise<InMemorySnapshot> {
        throw new Error('Method not implemented.');
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: Point
    ): InternalError | Valid {
        throw new Error('Method not implemented.');
    }

    protected buildEvent(
        _payload: TranslateSpatialFeatureName,
        _eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        throw new Error('Method not implemented.');
    }
}
