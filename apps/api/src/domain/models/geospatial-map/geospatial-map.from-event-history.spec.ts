import { LanguageCode } from '@coscrad/api-interfaces';
import { NotFound } from '../../../lib/types/not-found';
import { TestEventStream } from '../../../test-data/events';
import { buildMultilingualTextWithSingleItem } from '../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../common/entities/multilingual-text';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MapCreated } from './commands/map-created.event';
import { MapNameTranslated } from './commands/translate-map-name/map-name-translated.event';
import { GeospatialMap } from './geospatial-map.entity';

const geospatialId = buildDummyUuid(8);

const originalName = 'Text in language';

const originalDescription = 'this is my fishing spot';

const originalLanguageCode = LanguageCode.Chinook;

const mapCreated = new TestEventStream().andThen<MapCreated>(
    {
        type: 'MAP_CREATED',
        payload: {
            name: buildMultilingualTextWithSingleItem(
                originalName,
                originalLanguageCode
            ).getOriginalTextItem(),
            description: buildMultilingualTextWithSingleItem(
                originalDescription,
                originalLanguageCode
            ).getOriginalTextItem(),
        },
    },
    MapCreated
);

const translationText = `Translation of geospatial map: ${geospatialId}`;

const translationLanguageCode = LanguageCode.English;

const mapNameTranslated = mapCreated.andThen<MapNameTranslated>(
    {
        type: 'MAP_NAME_TRANSLATED',
        payload: {
            translationOfName: { text: translationText, languageCode: translationLanguageCode },
        },
    },
    MapNameTranslated
);

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

            describe(`when a geospatial map is created than translated`, () => {
                it(`should return the appropriate geospatial map`, () => {
                    const result = GeospatialMap.fromEventHistory(
                        mapNameTranslated.as({ id: geospatialId }),
                        geospatialId
                    );

                    expect(result).toBeInstanceOf(GeospatialMap);

                    const geospatialMap = result as GeospatialMap;

                    const translationItemSearchResult =
                        geospatialMap.name.getTranslation(translationLanguageCode);

                    expect(translationItemSearchResult).not.toBe(NotFound);

                    const { text: foundTranslationText } =
                        translationItemSearchResult as MultilingualTextItem;

                    expect(foundTranslationText).toBe(translationText);
                });
            });
        });
    });
});
