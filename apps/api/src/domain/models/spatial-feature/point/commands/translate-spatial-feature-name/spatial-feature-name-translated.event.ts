import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { SpatialFeatureCompositeIdentifier } from '../create-point.command';

export class SpatialFeatureNameTranslatedPayload {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NestedDataType(MultilingualTextItem, {
        label: 'translation item',
        description: 'the translation text and associated information',
    })
    readonly translationItem: MultilingualTextItem;
}

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
            translationItem: {
                text: 'spatial feature text',
                languageCode: LanguageCode.Chinook,
                role: MultilingualTextItemRole.freeTranslation,
            },
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(3),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('SPATIAL_FEATURE_NAME_TRANSLATED')
export class SpatialFeatureNameTranslated extends BaseEvent<SpatialFeatureNameTranslatedPayload> {
    readonly type = 'SPATIAL_FEATURE_NAME_TRANSLATED';
}
