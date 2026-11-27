import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../common';
import { GeospatialMapViewModel } from '../queries/geospatial-map.view-model';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../repositories/geospatial-map-query-repository.interface';
import { MapCreated } from './map-created.event';

@CoscradEventConsumer('MAP_CREATED')
export class MapCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IGeospatialMapQueryRepository
    ) {}

    async handle(event: MapCreated): Promise<void> {
        const view = GeospatialMapViewModel.fromMapCreated(event);

        await this.queryRepository.create(view);
    }
}
