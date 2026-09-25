import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandler } from '@coscrad/commands';
import { Valid } from '../../../../../domain/domainModelValidators/Valid';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { InMemorySnapshot } from '../../../../../domain/types/ResourceType';
import { InternalError, isInternalError } from '../../../../../lib/errors/InternalError';
import { isNotFound } from '../../../../../lib/types/not-found';
import formatAggregateCompositeIdentifier from '../../../../../queries/presentation/formatAggregateCompositeIdentifier';
import { ResultOrError } from '../../../../../types/ResultOrError';
import InvalidExternalReferenceByAggregateError from '../../../categories/errors/InvalidExternalReferenceByAggregateError';
import { BaseUpdateCommandHandler } from '../../../shared/command-handlers/base-update-command-handler';
import { BaseEvent, IEventPayload } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
import { Point } from '../../../spatial-feature/point/entities/point.entity';
import { GeospatialMap } from '../../geospatial-map.entity';
import { AddSpatialFeatureToMap } from './add-spatial-feature-to-map.command';
import { SpatialFeatureAddedToMap } from './spatial-feature-added-to-map.event';

@CommandHandler(AddSpatialFeatureToMap)
export class AddSpatialFeatureToMapCommandHandler extends BaseUpdateCommandHandler<GeospatialMap> {
    protected actOnInstance(
        instance: GeospatialMap,
        { spatialFeatureId }: AddSpatialFeatureToMap
    ): ResultOrError<GeospatialMap> {
        return instance.add(spatialFeatureId);
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
        { resources: { spatialFeature: allSpatialFeatures } }: InMemorySnapshot,
        instance: GeospatialMap,
        { spatialFeatureId }: AddSpatialFeatureToMap
    ): InternalError | Valid {
        if (
            !allSpatialFeatures.some(({ id }) => {
                id === spatialFeatureId;
            })
        ) {
            return new InvalidExternalReferenceByAggregateError(instance.getCompositeIdentifier(), [
                {
                    type: ResourceType.spatialFeature,
                    id: spatialFeatureId,
                },
            ]);
        }

        return Valid;
    }

    protected buildEvent(
        payload: AddSpatialFeatureToMap,
        eventMeta: EventRecordMetadata
    ): BaseEvent<IEventPayload> {
        const { aggregateCompositeIdentifier, spatialFeatureId } = payload;

        return new SpatialFeatureAddedToMap(
            {
                aggregateCompositeIdentifier,
                spatialFeatureId,
            },
            eventMeta
        );
    }
}
