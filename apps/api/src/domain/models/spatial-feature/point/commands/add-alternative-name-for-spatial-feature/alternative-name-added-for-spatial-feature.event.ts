import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType, NonEmptyString } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import { BaseEvent } from '../../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { SpatialFeatureCompositeIdentifier } from '../create-point.command';

export class AlternativeNameAddedForSpatialFeaturePayload {
    @NestedDataType(SpatialFeatureCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    @NonEmptyString({
        label: 'label',
        description: 'distinguishes this alternative name from others',
    })
    readonly label: string;

    @NestedDataType(MultilingualTextItem, {
        label: 'text item',
        description: 'text for the alternative name and associated information',
    })
    readonly textItem: MultilingualTextItem;
}

const testEventId = buildDummyUuid(1);

@CoscradDataExample<AlternativeNameAddedForSpatialFeature>({
    example: {
        id: testEventId,
        type: 'ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(4),
                type: AggregateType.spatialFeature,
            },
            label: 'label for alternative name',
            textItem: {
                text: 'alternative name text',
                languageCode: LanguageCode.Chilcotin,
                role: MultilingualTextItemRole.original,
            },
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(8),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE')
export class AlternativeNameAddedForSpatialFeature extends BaseEvent<AlternativeNameAddedForSpatialFeaturePayload> {
    readonly type = 'ALTERNATIVE_NAME_ADDED_FOR_SPATIAL_FEATURE';
}
