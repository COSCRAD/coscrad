import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import { BaseEvent } from '../../shared/events/base-event.entity';
import { SpatialFeatureCompositeIdentifier } from '../../spatial-feature/point/commands';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';

export class MapCreatedPayload {
    aggregateCompositeIdentifier: SpatialFeatureCompositeIdentifier;
    name: MultilingualTextItem;
    languageCodeForName: LanguageCode;
    description: MultilingualTextItem;
}

const testEventId = buildDummyUuid(3);

@CoscradDataExample<MapCreated>({
    example: {
        id: testEventId,
        type: 'MAP_CREATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(8),
                type: AggregateType.map,
            },
            name: {
                languageCode: LanguageCode.English,
                text: '5K trail',
                role: MultilingualTextItemRole.original,
            },
            languageCodeForName: LanguageCode.English,
            description: {
                languageCode: LanguageCode.Chinook,
                text: 'Description of my test map',
                role: MultilingualTextItemRole.original,
            },
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(9),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
export class MapCreated extends BaseEvent<MapCreatedPayload> {
    readonly type = 'MAP_CREATED';
}
