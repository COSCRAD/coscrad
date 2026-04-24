import { Inject } from '@nestjs/common';
import { ICoscradEventHandler } from '../../../../../domain/common';
import { SpatialFeatureViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/spatial-data/spatial-feature.view-model';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../queries/spatial-feature-query-repository.interface';
import { PointCreated } from './point-created.event';

export class PointCreatedEventHandler implements ICoscradEventHandler {
    private readonly pointQueryRepository: ISpatialFeatureQueryRepository;

    constructor(
        @Inject(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN)
        private readonly queryRepository: ISpatialFeatureQueryRepository
    ) {}

    async handle(event: PointCreated): Promise<void> {
        const view = SpatialFeatureViewModel.fromPointCreated(event);
        await this.queryRepository.create(view);
    }
}
