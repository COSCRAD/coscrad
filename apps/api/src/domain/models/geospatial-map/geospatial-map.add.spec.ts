import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { InternalError } from '../../../lib/errors/InternalError';
import { TestEventStream } from '../../../test-data/events';
import { ResourceType } from '../../types/ResourceType';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MapCreated } from './commands/map-created.event';
import { GeospatialMap } from './geospatial-map.entity';

const mapId = buildDummyUuid(1);

const mapName = "Aaron's Stompin' Grounds";

const spatialFeatureId = buildDummyUuid(2);

const emptyMap = GeospatialMap.fromEventHistory(
    new TestEventStream()
        .andThen<MapCreated>(
            {
                type: 'MAP_CREATED',
                payload: {
                    aggregateCompositeIdentifier: { id: mapId },
                    name: {
                        text: mapName,
                        languageCode: LanguageCode.English,
                        role: MultilingualTextItemRole.original,
                    },
                },
            },
            MapCreated
        )
        .as({
            type: ResourceType.map,
            id: mapId,
        }),
    mapId
) as GeospatialMap;

describe(`GeospatialMap.add`, () => {
    describe(`when the request is valid`, () => {
        it(`should add the spatial feature`, () => {
            const result = emptyMap.add(spatialFeatureId);

            expect(result).toBeInstanceOf(GeospatialMap);

            expect((result as GeospatialMap).spatialFeatures).toContain(spatialFeatureId);
        });
    });

    describe(`when the update is invalid `, () => {
        describe(`when the map already has the given spatial feature`, () => {
            it(`should return the expected error`, () => {
                const mapWithSpatialFeatureAlready = emptyMap.add(
                    spatialFeatureId
                ) as GeospatialMap;

                const result = mapWithSpatialFeatureAlready.add(spatialFeatureId);

                const message = (result as InternalError).toString();

                expect(message).toContain('duplicate');
                expect(message).toContain(spatialFeatureId);
                expect(message).toContain(mapName);
            });
        });

        // future scoped
        describe(`when the point falls outside of the bounds of the map`, () => {
            it.todo(`should return the expected error`);
        });
    });
});
