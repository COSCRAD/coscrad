import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import {
    GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN,
    IGeospatialMapQueryRepository,
} from '../../repositories/geospatial-map-query-repository.interface';
import { MapNameTranslated } from './map-name-translated.event';

export class MapNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(GEOSPATIAL_MAP_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: IGeospatialMapQueryRepository
    ) {}

    async handle(event: MapNameTranslated): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id: mapId },
                translationOfName,
            },
        } = event;

        await this.queryRepository.translateName(mapId, translationOfName);
    }
}
