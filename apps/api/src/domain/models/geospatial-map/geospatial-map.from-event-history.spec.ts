import { LanguageCode } from '@coscrad/api-interfaces';
import { TestEventStream } from '../../../test-data/events';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MapCreated } from './commands/map-created.event';
import { MapNameTranslated } from './commands/translate-map-name/map-name-translated.event';
import { GeospatialMap } from './geospatial-map.entity';

const geospatialId = buildDummyUuid(8);

const originalText = 'Text in language';

const originalLanguageCode = LanguageCode.Chinook;

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
        payload: {
            name: originalText,
            languageCodeForName: originalLanguageCode,
        },
    },
    MapCreated
);

const translationText = `Translation of geospatial map: ${geospatialId}`;

const _translationLanguageCode = LanguageCode.English;

const _mapNameTranslated = mapCreated.andThen<MapNameTranslated>({
    type: 'MAP_NAME_TRANSLATED',
    payload: {
        name: translationText,
    },
});

describe(`Geospatial-map.fromEventHistory`, () => {
    describe(`when the event history is valid`, () => {
        describe(`when the map has been created`, () => {
            describe(`when there is a creation event`, () => {
                it(`should return the expected result`, () => {
                    const result = GeospatialMap.fromEventHistory(
                        mapCreated.as({
                            id: geospatialId,
                        }),
                        geospatialId
                    );

                    expect(result).toBeInstanceOf(GeospatialMap);

                    const { eventHistory } = result as GeospatialMap;

                    expect(eventHistory).toHaveLength(1);
                });
            });
        });
    });
});
