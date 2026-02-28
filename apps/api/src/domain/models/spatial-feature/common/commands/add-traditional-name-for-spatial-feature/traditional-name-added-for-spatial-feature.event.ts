import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CoscradEvent } from '../../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../../domain/common/entities/multilingual-text';
import { BaseEvent } from '../../../../../../queries/event-sourcing';
import { CoscradDataExample } from '../../../../../../test-data/utilities';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../../__tests__/utilities/dummyDateNow';
import { SpatialFeatureCompositeIdentifier } from '../../../point/commands';

export class TraditionalNameAddedForSpatialFeaturePayload {
    aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;

    text: MultilingualTextItem;
}

const testEventId = buildDummyUuid(3);

@CoscradDataExample<TraditionalNameAddedForSpatialFeature>({
    example: {
        type: 'TRADITIONAL_NAME_ADDED_FOR_SPATIAL_FEATURE',
        id: testEventId,
        payload: {
            aggregateCompositeIdentifier: {
                type: AggregateType.spatialFeature,
                id: buildDummyUuid(4),
            },
            text: {
                text: 'I am fast',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original,
            },
        },
        meta: {
            userId: buildDummyUuid(32),
            contributorIds: [],
            dateCreated: dummyDateNow,
            id: testEventId,
        },
    },
})
@CoscradEvent(`TRADITIONAL_NAME_ADDED_FOR_SPATIAL_FEATURE`)
export class TraditionalNameAddedForSpatialFeature extends BaseEvent<TraditionalNameAddedForSpatialFeaturePayload> {
    readonly type = `TRADITIONAL_NAME_ADDED_FOR_SPATIAL_FEATURE`;
}
