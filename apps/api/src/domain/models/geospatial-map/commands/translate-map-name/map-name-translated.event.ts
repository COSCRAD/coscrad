import { AggregateType, LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { NestedDataType } from '@coscrad/data-types';
import { plainToInstance } from 'class-transformer';
import { CoscradEvent } from '../../../../../domain/common';
import { MultilingualTextItem } from '../../../../../domain/common/entities/multilingual-text';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { EventRecordMetadata } from '../../../shared/events/types/EventRecordMetadata';
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
        label: `translation of the map's name`,
        description: 'the translation text and associated information',
    })
    readonly translationOfName: MultilingualTextItem;
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
            translationOfName: new MultilingualTextItem({
                text: 'geospatial map name',
                languageCode: LanguageCode.English,
                role: MultilingualTextItemRole.original,
            }),
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

    constructor(payload: MapNameTranslatedPayload, metadata: EventRecordMetadata) {
        super(payload, metadata);

        this.payload = plainToInstance(MapNameTranslatedPayload, payload);
    }
}
