import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../../../domain/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { Resource } from '../../../domain/models/resource.entity';
import { ResourcePublished } from '../../../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { LyricsAddedForSong, SongCreated } from '../../../domain/models/song/commands';
import { Song } from '../../../domain/models/song/song.entity';
import {
    PromptTermCreated,
    TermCreated,
    TermElicitedFromPrompt,
    TermTranslated,
} from '../../../domain/models/term/commands';
import { Term } from '../../../domain/models/term/entities/term.entity';
import { InternalError } from '../../../lib/errors/InternalError';
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

const existingEvents = [
    buildTestInstance(ResourcePublished, {
        id: buildDummyUuid(900),
        meta: {
            id: buildDummyUuid(900),
        },
        payload: {
            aggregateCompositeIdentifier: {
                type: ResourceType.digitalText,
            },
        },
    }),
].map(mapEntityDTOToDatabaseDocument);

const dummyUuuids = [1, 2, 3, 4, 5].map(buildDummyUuid);

const migrationUnderTest = new MigrateEventsFromLegacySnapshotCollections();

describe(`MigrateEventsFromLegacySnapshotCollections`, () => {
    let testDatabaseProvider: ArangoDatabaseProvider;

    let testQueryRunner: ArangoQueryRunner;

    let testRepositoryProvider: TestRepositoryProvider;

    const assertMigrationSuccess = async (oldResources: Resource[], collectionId: string) => {
        if (oldResources.length === 0) {
            throw new InternalError(
                `You must provide at least one resource in the old format for a migration teset case`
            );
        }

        const resourceEvents = oldResources.flatMap(({ eventHistory }) => eventHistory);

        const oldDocuments = oldResources
            .map((resource) => resource.toDTO())
            .map(mapEntityDTOToDatabaseDocument);

        await testDatabaseProvider.getDatabaseForCollection(collectionId).createMany(oldDocuments);

        await testDatabaseProvider
            .getDatabaseForCollection(ArangoCollectionId.events)
            .createMany(existingEvents);

        await migrationUnderTest.up(testQueryRunner);

        const updatedDocs = await testDatabaseProvider
            .getDatabaseForCollection(collectionId)
            .fetchMany();

        const oldResourceDocsWithoutArangoSystemProps = oldDocuments.map(removeArangoSystemProps);

        // this migration should not change the data
        // can we use a check sum for this colleciton?
        expect(updatedDocs.map(removeArangoSystemProps)).toEqual(
            oldResourceDocsWithoutArangoSystemProps
        );

        const updatedEvents = await testDatabaseProvider
            .getDatabaseForCollection<BaseEvent>(ArangoCollectionId.events)
            .fetchMany();

        expect(updatedEvents).toHaveLength(resourceEvents.length + existingEvents.length);

        const missingEvents = resourceEvents.filter(
            ({ type, meta: { dateCreated, id } }) =>
                !updatedEvents.some(
                    (e) => e.type === type && dateCreated === e.meta.dateCreated && id === e._key
                )
        );

        expect(missingEvents).toHaveLength(0);

        const eventsWithAnIdProp = updatedEvents.filter(
            (e) => !isNullOrUndefined((e as unknown as { id: string }).id)
        );

        expect(eventsWithAnIdProp).toHaveLength(0);
    };

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
        const oldSongs = dummyUuuids.map((songId) => {
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

        it(`should append the events to the event collection`, async () => {
            await assertMigrationSuccess(oldSongs, 'songs');
        });
    });

    describe(`when some of the events are already in the database`, () => {
        it.todo(`should have a test`);
    });

    describe(`when migrating terms`, () => {
        const oldRegularTerms = dummyUuuids.map(
            (termId) =>
                Term.fromEventHistory(
                    new TestEventStream()
                        .andThen<TermCreated>({
                            type: 'TERM_CREATED',
                        })
                        .andThen<TermTranslated>({
                            type: 'TERM_TRANSLATED',
                        })
                        .andThen<ResourcePublished>({
                            type: 'RESOURCE_PUBLISHED',
                        })
                        .as({
                            type: AggregateType.term,
                            id: termId,
                        }),
                    termId
                ) as Term
        );

        const oldPromptTerms = [11, 12, 13, 14, 15].map(buildDummyUuid).map(
            (termId) =>
                Term.fromEventHistory(
                    new TestEventStream()
                        .andThen<PromptTermCreated>({
                            type: 'PROMPT_TERM_CREATED',
                        })
                        .andThen<TermElicitedFromPrompt>({
                            type: 'TERM_ELICITED_FROM_PROMPT',
                        })
                        .as({
                            type: AggregateType.term,
                            id: termId,
                        }),
                    termId
                ) as Term
        );

        it(`should append the events to the event collection`, async () => {
            await assertMigrationSuccess([...oldRegularTerms, ...oldPromptTerms], 'terms');
        });
    });

    // AggregateType.term,
    // AggregateType.vocabularyList,
    // AggregateType.playlist,
    // AggregateType.audioItem,
    // AggregateType.video,
});
