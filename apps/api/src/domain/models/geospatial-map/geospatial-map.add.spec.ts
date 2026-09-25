import { TestEventStream } from '../../../test-data/events';
import { ResourceType } from '../../types/ResourceType';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import { MapCreated } from './commands/map-created.event';
import { GeospatialMap } from './geospatial-map.entity';

const mapId = buildDummyUuid(1);

const spatialFeatureId = buildDummyUuid(2);

const emptyMap = GeospatialMap.fromEventHistory(
    new TestEventStream()
        .andThen<MapCreated>(
            {
                type: 'MAP_CREATED',
                payload: {
                    aggregateCompositeIdentifier: { id: mapId },
                },
            },
            MapCreated
        )
        .as({
            type: ResourceType.map,
            id: mapId,
        }),
    // [
    //     new TestEventStream().buildSingle<MapCreated>(
    //         {
    //             type: 'MAP_CREATED',
    //             payload: {
    //                 aggregateCompositeIdentifier: { id: mapId },
    //             },
    //         },
    //         MapCreated
    //     ),
    // ],
    mapId
) as GeospatialMap;

describe(`GeospatialMap.add`, () => {
    describe(`when the request is valid`, () => {
        it(`should add the spatial feature`, () => {
            const result = emptyMap.add(spatialFeatureId);

            expect(result).toBeInstanceOf(GeospatialMap);

            expect(result.spatialFeatures).toContain(spatialFeatureId);
        });
    });

    describe(`when the update is invalid `, () => {
        describe(`when the map already has the given spatial feature`, () => {
            it.todo(`should return the expected error`);
        });
    });
});
