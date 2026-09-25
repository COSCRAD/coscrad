import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../domain/common';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';
import { EventSourcedSpatialFeatureViewModel } from '../../queries/spatial-feature.view-model.event-sourced';
import { PointCreated } from './point-created.event';

@CoscradEventConsumer('POINT_CREATED')
export class PointCreatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: ISpatialFeatureQueryRepository
    ) {}

    async handle(event: PointCreated): Promise<void> {
        const view = EventSourcedSpatialFeatureViewModel.fromPointCreated(event);
        await this.queryRepository.create(view);
    }
}
