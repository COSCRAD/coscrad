import { Inject } from '@nestjs/common';
import { CoscradEventConsumer, ICoscradEventHandler } from '../../../../../../domain/common';
import {
    ISpatialFeatureQueryRepository,
    SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN,
} from '../../../queries/spatial-feature-query-repository.interface';
import { AlternativeNameAddedForSpatialFeature } from './alternative-name-added-for-spatial-feature.event';

@CoscradEventConsumer('ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE')
export class AlternativeNameAddedForSpatialFeatureEventHandler
    implements ICoscradEventHandler<AlternativeNameAddedForSpatialFeature>
{
    constructor(
        @Inject(SPATIAL_FEATURE_QUERY_REPOSITORY_TOKEN)
        private readonly repository: ISpatialFeatureQueryRepository
    ) {}

    async handle({
        payload: {
            aggregateCompositeIdentifier: { id },
            label,
            textItem,
        },
    }: AlternativeNameAddedForSpatialFeature): Promise<void> {
        await this.repository.addAlternativeName(id, label, textItem.text, textItem.languageCode);
    }
}
