import { AggregateType } from '@coscrad/api-interfaces';
import { ICommand } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../../types/ResultOrError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../../spatial-feature/point/entities/point.entity';
import { GeospatialMap } from '../../geospatial-map.entity';
import { AddSpatialFeatureToMap } from './add-spatial-feature-to-map.command';

export class AddSpatialFeatureToMapCommandHandler extends BaseUpdateCommandHandler<GeospatialMap> {
    protected actOnInstance(
        _instance: GeospatialMap,
        _command: AddSpatialFeatureToMap
    ): ResultOrError<GeospatialMap> {
        throw new Error('Method not implemented.');
    }

    protected async fetchRequiredExternalState({
        spatialFeatureId,
    }: AddSpatialFeatureToMap): Promise<InMemorySnapshot> {
        const spatialFeatureSearchResult = await this.repositoryProvider
            .forResource<Point>(AggregateType.spatialFeature)
            .fetchById(spatialFeatureId);

        if (isInternalError(spatialFeatureSearchResult)) {
            throw new InternalError(
                `Encountered invalid existing data for ${formatAggregateCompositeIdentifier({
                    type: AggregateType.spatialFeature,
                    id: spatialFeatureId,
                })}`
            );
        }

        const allSpatialFeatures: Point[] = isNotFound(spatialFeatureSearchResult)
            ? []
            : [spatialFeatureSearchResult];

        return Promise.resolve(
            new DeluxeInMemoryStore({
                [AggregateType.spatialFeature]: allSpatialFeatures,
            }).fetchFullSnapshotInLegacyFormat()
        );
    }

    protected validateExternalState(
        _state: InMemorySnapshot,
        _instance: GeospatialMap,
        _command?: ICommand
    ): InternalError | Valid {
        return Valid;
    }

    protected buildEvent(
        _payload: AddSpatialFeatureToMap,
        _eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        throw new Error('Method not implemented.');
    }
}
