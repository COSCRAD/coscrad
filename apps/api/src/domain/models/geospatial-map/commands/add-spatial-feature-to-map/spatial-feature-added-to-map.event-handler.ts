import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../../repositories/geospatial-map-query-repository.interface';
import { SpatialFeatureAddedToMap } from './spatial-feature-added-to-map.event';

export class SpatialFeatureAddedToMapEventHandler
    implements ICoscradEventHandler<SpatialFeatureAddedToMap>
{
    constructor(
        @Inject(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IGeospatialMapQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id: mapId },
            spatialFeatureId,
        },
    }: SpatialFeatureAddedToMap): Promise<void> {
        await this.queryRepository.addSpatialFeature(mapId, spatialFeatureId);
    }
}
