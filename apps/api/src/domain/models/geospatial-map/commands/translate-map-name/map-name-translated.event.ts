import { AggregateType } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { CoscradEvent } from '../../../../../domain/common';
import { buildMultilingualTextWithSingleItem } from '../../../../../domain/common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { GeospatialMapCompositeIdentifier } from '../create-map.command';

export class MapNameTranslatedPayload {
    @NestedDataType(GeospatialMapCompositeIdentifier, {
        label: 'composite identifier',
        description: 'system-wide unique identifier',
    })
    readonly aggregateCompositeIdentifier: GeospatialMapCompositeIdentifier;

    @NestedDataType(MultilingualTextItem, {
        label: 'translation for map name',
        description: 'the translation text and associated information',
    })
    readonly name: MultilingualTextItem;
}

const testEventId = buildDummyUuid(5);

@CoscradDataExample<MapNameTranslated>({
    example: {
        id: testEventId,
        type: 'MAP_NAME_TRANSLATED',
        payload: {
            aggregateCompositeIdentifier: {
                id: buildDummyUuid(43),
                type: AggregateType.map,
            },
            // TODO find something better to do this
            name: buildMultilingualTextWithSingleItem(
                'geospatial map name text'
            ).getOriginalTextItem(),
        },
        meta: {
            id: testEventId,
            userId: buildDummyUuid(8),
            contributorIds: [],
            dateCreated: dummyDateNow,
        },
    },
})
@CoscradEvent('MAP_NAME_TRANSLATED')
export class MapNameTranslated extends BaseEvent<MapNameTranslatedPayload> {
    readonly type = `MAP_NAME_TRANSLATED`;
}
