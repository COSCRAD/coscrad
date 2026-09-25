import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradDataExample } from '../../../../test-data/utilities';
import { CoscradEvent } from '../../../common';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import { AggregateType } from '../../../types/AggregateType';
import { BaseEvent } from '../../shared/events/base-event.entity';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import { GeospatialMapCompositeIdentifier } from './create-map.command';

// TODO Add decorators
export class MapCreatedPayload {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite ID',
        description: 'system wide unique identifier to this map',
    })
    aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @NestedDataType(MultilingualTextItem, {
        label: 'name',
        description: `the map's name (and language used for naming)`,
    })
    name: MultilingualTextItem;

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
@CoscradEvent('MAP_CREATED')
export class MapCreated extends BaseEvent<MapCreatedPayload> {
    readonly type = 'MAP_CREATED';
}
