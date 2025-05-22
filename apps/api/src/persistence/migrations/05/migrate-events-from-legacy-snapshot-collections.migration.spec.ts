import { AggregateType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../../../domain/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { LyricsAddedForSong, SongCreated } from '../../../domain/models/song/commands';
import { Song } from '../../../domain/models/song/song.entity';
import { TermCreated, TermTranslated } from '../../../domain/models/term/commands';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseEvent } from '../../../queries/event-sourcing';
import { TestEventStream } from '../../../test-data/events';
import { buildTestInstance } from '../../../test-data/utilities';
import { DynamicDataTypeFinderService } from '../../../validation';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../database/utilities/mapEntityDTOToDatabaseDocument';
import generateDatabaseNameForTestSuite from '../../repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../repositories/__tests__/TestRepositoryProvider';
import { MigrateEventsFromLegacySnapshotCollections } from './migrate-events-from-legacy-snapshot-collections.migration';

type WithArangoSystemProps<T> = {
    _key: string;
    _id: string;
    _rev: string;
} & T;

const removeArangoSystemProps = <T>(doc: WithArangoSystemProps<T>): T => {
    const out = cloneToPlainObject(doc);

    delete out._key;

    delete out._id;

    delete out._rev;

    return out;
};

// TODO add some
const existingEvents = [
    buildTestInstance(TermCreated, {
        id: buildDummyUuid(900),
    }),
    buildTestInstance(TermTranslated, {
        id: buildDummyUuid(901),
    }),
].map(mapEntityDTOToDatabaseDocument);

const oldSongs = [1, 2, 3, 4, 5].map((n) => {
    const songId = buildDummyUuid(n);

    return Song.fromEventHistory(
        new TestEventStream()
            .andThen<SongCreated>({
                type: 'SONG_CREATED',
            })
            .andThen<LyricsAddedForSong>({
                type: 'LYRICS_ADDED_FOR_SONG',
            })
            .as({
                type: AggregateType.song,
                id: songId,
            }),
        songId
        // We are asserting that the event history is valid
    ) as Song;
});

const songEvents = oldSongs.flatMap(({ eventHistory }) => eventHistory);

const oldSongDocuments = oldSongs.map((song) => song.toDTO()).map(mapEntityDTOToDatabaseDocument);

const migrationUnderTest = new MigrateEventsFromLegacySnapshotCollections();

describe(`MigrateEventsFromLegacySnapshotCollections`, () => {
    let testDatabaseProvider: ArangoDatabaseProvider;

    let testQueryRunner: ArangoQueryRunner;

    let testRepositoryProvider: TestRepositoryProvider;

    beforeAll(async () => {
        const testModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider = testModule.get(ArangoConnectionProvider);

        testDatabaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        const coscradEventFactory = testModule.get(CoscradEventFactory);

        /**
         * It's a bit awkward that we need this because we are not working at
         * the repositories level of abstraction. However, we have added test
         * setup and teardown logic at this level for the purpose of command and
         * query integration tests. So instead of rewriting this logic on a
         * `TestDatabaseProvider`, we will just leverage this existing logic for
         * test teardown.
         */
        testRepositoryProvider = new TestRepositoryProvider(
            testDatabaseProvider,
            coscradEventFactory,
            testModule.get(DynamicDataTypeFinderService)
        );

        testQueryRunner = new ArangoQueryRunner(testDatabaseProvider);
    });

    beforeEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    describe(`when migrating songs`, () => {
        beforeEach(async () => {
            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.songs)
                .createMany(oldSongDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.events)
                .createMany(existingEvents);
        });

        it(`should append the events to the event collection`, async () => {
            await migrationUnderTest.up(testQueryRunner);

            const updatedDocs = await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.songs)
                .fetchMany();

            const oldSongDocsWithoutArangoSystemProps =
                oldSongDocuments.map(removeArangoSystemProps);

            // this migration should not change the data
            // can we use a check sum for this colleciton?
            expect(updatedDocs.map(removeArangoSystemProps)).toEqual(
                oldSongDocsWithoutArangoSystemProps
            );

            const updatedEvents = await testDatabaseProvider
                .getDatabaseForCollection<BaseEvent>(ArangoCollectionId.events)
                .fetchMany();

            expect(updatedEvents).toHaveLength(songEvents.length + existingEvents.length);

            const missingEvents = songEvents.filter(
                ({ type, meta: { dateCreated, id } }) =>
                    !updatedEvents.some(
                        (e) =>
                            e.type === type && dateCreated === e.meta.dateCreated && id === e._key
                    )
            );

            expect(missingEvents).toHaveLength(0);

            const eventsWithAnIdProp = updatedEvents.filter(
                (e) => !isNullOrUndefined((e as unknown as { id: string }).id)
            );

            expect(eventsWithAnIdProp).toHaveLength(0);
        });
    });
});
