import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { TranslateSpatialFeatureName } from './translate-spatial-feature-name.command';

export type SpatialFeatureNameTranslatedPayload = TranslateSpatialFeatureName;

const testEventId = buildDummyUuid(6);

@CoscradDataExample<SpatialFeatureNameTranslated>({
    example: {
        id: testEventId,
        type: 'SPATIAL_FEATURE_NAME_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(34),
                type: AggregateType.spatialFeature,
            },
            translation: 'spatial feature text',
            languageCode: LanguageCode.English,
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(3),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
export class SpatialFeatureNameTranslated extends BaseEvent<SpatialFeatureNameTranslatedPayload> {
    readonly type = 'SPATIAL_FEATURE_NAME_TRANSLATED';
}
