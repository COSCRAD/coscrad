import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../../queries/spatial-feature-query-repository.interface';
import { SpatialFeatureNameTranslated } from './spatial-feature-name-translated.event';

@CoscradEventConsumer('SPATIAL_FEATURE_NAME_TRANSLATED')
export class SpatialFeatureNameTranslatedEventHandler implements ICoscradEventHandler {
    constructor(
        @Inject(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN)
        private readonly spatialFeatureRepository: ISpatialFeatureQueryRepository
    ) {}

    async handle(event: SpatialFeatureNameTranslated): Promise<void> {
        const {
            payload: {
                aggregateCompositeIdentifier: { id: spatialFeatureId },
                translationItem: { text, languageCode },
            },
        } = event;

        await this.spatialFeatureRepository.translateSpatialFeatureName(
            spatialFeatureId,
            text,
            languageCode
        );
    }
}
