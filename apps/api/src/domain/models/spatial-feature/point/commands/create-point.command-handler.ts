import { AggregateType, GeometricFeatureType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { Valid } from '../../../../domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../types/ResourceType';
import { BaseCreateCommandHandler } from '../../../shared/command-handlers/base-create-command-handler';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { validAggregateOrThrow } from '../../../shared/functional';
import { Point } from '../entities/point.entity';
import { CreatePoint } from './create-point.command';
import { PointCreated } from './point-created.event';

@CommandHandler(CreatePoint)
export class CreatePointCommandHandler extends BaseCreateCommandHandler<Point> {
    protected createNewInstance({
        aggregateCompositeIdentifier: { id },
        lattitude,
        longitude,
        name,
        description,
        imageUrl,
    }: CreatePoint): ResultOrError<Point> {
        return new Point({
            type: AggregateType.spatialFeature,
            id,
            geometry: {
                type: GeometricFeatureType.point,
                coordinates: [lattitude, longitude],
            },
            properties: {
                name,
                description,
                imageUrl,
            },
            // You must run a `PUBLISH_RESOURCE` command to publish this point
            published: false,
            hasBeenDeleted: false,
        });
    }

    protected async fetchRequiredExternalState(_?: CreatePoint): Promise<InMemorySnapshot> {
        const allSpatialFeatures = (
            await this.repositoryProvider.forResource(ResourceType.spatialFeature).fetchMany()
        ).filter(validAggregateOrThrow);

        return new DeluxeInMemoryStore({
            [AggregateType.spatialFeature]: allSpatialFeatures,
        }).fetchFullSnapshotInLegacyFormat();
    }

    protected validateExternalState(
        externalState: InMemorySnapshot,
        point: Point
    ): InternalError | Valid {
        return point.validateExternalState(externalState);
    }

    protected buildEvent(command: CreatePoint, eventMeta: EventRecordMetadata): BaseEvent {
        return new PointCreated(command, eventMeta);
    }
}
