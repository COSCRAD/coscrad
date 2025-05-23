import { AggregateType, ResourceType } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
import createTestModule from '../../../app/controllers/__tests__/createTestModule';
import { CoscradEventFactory } from '../../../domain/common';
import buildDummyUuid from '../../../domain/models/__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../../../domain/models/audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItemNameTranslated } from '../../../domain/models/audio-visual/audio-item/commands/translate-audio-item-name/audio-item-name-translated-event';
import { AudioItem } from '../../../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { VideoCreated, VideoNameTranslated } from '../../../domain/models/audio-visual/video';
import { Video } from '../../../domain/models/audio-visual/video/entities/video.entity';
import { Playlist } from '../../../domain/models/playlist';
import { AudioItemAddedToPlaylist } from '../../../domain/models/playlist/commands/add-audio-item-to-playlist/audio-item-added-to-playlist.event';
import { PlaylistCreated } from '../../../domain/models/playlist/commands/playlist-created.event';
import { PlaylistNameTranslated } from '../../../domain/models/playlist/commands/translate-playlist-name/playlist-name-translated.event';
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
import {
    TermAddedToVocabularyList,
    VocabularyListCreated,
} from '../../../domain/models/vocabulary-list/commands';
import { VocabularyListNameTranslated } from '../../../domain/models/vocabulary-list/commands/translate-vocabulary-list-name/vocabulary-list-name-translated.event';
import { VocabularyList } from '../../../domain/models/vocabulary-list/entities/vocabulary-list.entity';
import cloneToPlainObject from '../../../lib/utilities/cloneToPlainObject';
import { BaseEvent } from '../../../queries/event-sourcing';
import { TestEventStream } from '../../../test-data/events';
import { buildTestInstance } from '../../../test-data/utilities';
import { DTO } from '../../../types/DTO';
import { DynamicDataTypeFinderService } from '../../../validation';
import { ArangoConnectionProvider } from '../../database/arango-connection.provider';
import { ArangoQueryRunner } from '../../database/arango-query-runner';
import { ArangoCollectionId } from '../../database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../database/database.provider';
import mapEntityDTOToDatabaseDocument, {
    ArangoDatabaseDocument,
} from '../../database/utilities/mapEntityDTOToDatabaseDocument';
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

    const assertEventsMigratedForResource = async (
        oldDocuments: ArangoDatabaseDocument<DTO<Resource>>[],
        resourceEvents: BaseEvent[],
        collectionId: string,
        updatedEvents: ArangoDatabaseDocument<DTO<BaseEvent>>[]
    ) => {
        const updatedDocs = await testDatabaseProvider
            .getDatabaseForCollection(collectionId)
            .fetchMany();

        const oldResourceDocsWithoutArangoSystemProps = oldDocuments.map(removeArangoSystemProps);

        const updatedDocsWithoutSystemProps = updatedDocs.map(removeArangoSystemProps);

        // this migration should not change the data
        // can we use a check sum for this colleciton?
        expect(updatedDocsWithoutSystemProps).toEqual(oldResourceDocsWithoutArangoSystemProps);

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

        const playlistCreatedEvents = updatedEvents.filter(
            ({ type }) => type === 'PLAYLIST_CREATED'
        );

        expect(playlistCreatedEvents).toHaveLength(3);
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

    describe(`when migrating songs, terms, vocabulary lists, audio items, videos, and playlists`, () => {
        /**
         * SONGS
         */
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

        const songEvents = oldSongs.flatMap(({ eventHistory }) => eventHistory);

        const oldSongDocuments = oldSongs
            .map((resource) => resource.toDTO())
            .map(mapEntityDTOToDatabaseDocument);

        /**
         * TERMS
         *
         * It's important to have some Prompt Terms here as well.
         */

        const oldRegularTerms = [105, 106, 107].map(buildDummyUuid).map(
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

        const oldPromptTerms = [108, 109, 110, 111, 112].map(buildDummyUuid).map(
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

        const oldTerms = [...oldPromptTerms, ...oldRegularTerms];

        const termEvents = oldTerms.flatMap(({ eventHistory }) => eventHistory);

        const oldTermDocuments = oldTerms.map((t) => mapEntityDTOToDatabaseDocument(t.toDTO()));

        /**
         * VocabularyLists
         */
        const oldVocabularyLists = [140, 141].map(buildDummyUuid).map(
            (vocabularyListId) =>
                VocabularyList.fromEventHistory(
                    new TestEventStream()
                        .andThen<VocabularyListCreated>({
                            type: 'VOCABULARY_LIST_CREATED',
                        })
                        .andThen<VocabularyListNameTranslated>({
                            type: 'VOCABULARY_LIST_NAME_TRANSLATED',
                        })
                        .andThen<TermAddedToVocabularyList>({
                            type: 'TERM_ADDED_TO_VOCABULARY_LIST',
                            payload: {
                                termId: oldRegularTerms[0].id,
                            },
                        })
                        .as({
                            id: vocabularyListId,
                            type: AggregateType.vocabularyList,
                        }),
                    vocabularyListId
                ) as VocabularyList
        );

        const vocabularyListEvents = oldVocabularyLists.flatMap(({ eventHistory }) => eventHistory);

        const oldVocabularyListDocuments = oldVocabularyLists.map((v) =>
            mapEntityDTOToDatabaseDocument(v.toDTO())
        );

        /**
         * AudioItems
         */
        const oldAudioItems = [150, 151, 152, 153].map(buildDummyUuid).flatMap(
            (audioItemId) =>
                AudioItem.fromEventHistory(
                    new TestEventStream()
                        .andThen<AudioItemCreated>({
                            type: 'AUDIO_ITEM_CREATED',
                        })
                        .andThen<AudioItemNameTranslated>({
                            type: 'AUDIO_ITEM_NAME_TRANSLATED',
                        })
                        .as({
                            type: AggregateType.audioItem,
                            id: audioItemId,
                        }),
                    audioItemId
                ) as AudioItem
        );

        const audioItemEvents = oldAudioItems.flatMap(({ eventHistory }) => eventHistory);

        const oldAudioItemDocuments = oldAudioItems.map((a) =>
            mapEntityDTOToDatabaseDocument(a.toDTO())
        );

        /**
         * Videos
         */
        const oldVideos = [160, 161, 162, 163].map(buildDummyUuid).flatMap(
            (videoId) =>
                Video.fromEventHistory(
                    new TestEventStream()
                        .andThen<VideoCreated>({
                            type: 'VIDEO_CREATED',
                        })
                        .andThen<VideoNameTranslated>({
                            type: 'VIDEO_NAME_TRANSLATED',
                        })
                        .andThen<ResourcePublished>({
                            type: 'RESOURCE_PUBLISHED',
                        })
                        .as({
                            type: AggregateType.video,
                            id: videoId,
                        }),
                    videoId
                ) as Video
        );

        const videoEvents = oldVideos.flatMap(({ eventHistory }) => eventHistory);

        const oldVideoDocuments = oldVideos.map((v) => mapEntityDTOToDatabaseDocument(v.toDTO()));

        /**
         * Playlists
         */

        const oldPlaylists = [200, 201, 202].map((sequenceNumber) => {
            const playlistId = buildDummyUuid(sequenceNumber);

            return Playlist.fromEventHistory(
                new TestEventStream()
                    .andThen<PlaylistCreated>({
                        type: 'PLAYLIST_CREATED',
                        payload: {
                            name: `Playlist number: ${sequenceNumber}`,
                        },
                    })
                    .andThen<PlaylistNameTranslated>({
                        type: 'PLAYLIST_NAME_TRANSLATED',
                    })
                    .andThen<AudioItemAddedToPlaylist>({
                        type: 'AUDIO_ITEM_ADDED_TO_PLAYLIST',
                        payload: {
                            audioItemId: oldPromptTerms[0].id,
                        },
                    })
                    .as({
                        type: AggregateType.playlist,
                        id: playlistId,
                    }),
                playlistId
            ) as Playlist;
        });

        /**
         * Note that the playlist test case includes some events already in the
         * events collection and others that are only on the snapshot.
         */
        const playlistWhoseEventsAreAlreadyIncollection = oldPlaylists[0];

        const playlistEventsAlreadyInEventsCollection =
            playlistWhoseEventsAreAlreadyIncollection.eventHistory;

        const playlistsWhoseEventsAreNotInEventsCollection = [oldPlaylists[1], oldPlaylists[2]];

        const playlistEventsNotInEventsCollection =
            playlistsWhoseEventsAreNotInEventsCollection.flatMap(
                ({ eventHistory }) => eventHistory
            );

        const oldPlaylistDocuments = oldPlaylists.map((p) =>
            mapEntityDTOToDatabaseDocument(p.toDTO())
        );

        beforeEach(async () => {
            await testDatabaseProvider
                .getDatabaseForCollection('songs')
                .createMany(oldSongDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection('terms')
                .createMany(oldTermDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection('vocabulary_lists')
                .createMany(oldVocabularyListDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection('audio_items')
                .createMany(oldAudioItemDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection('videos')
                .createMany(oldVideoDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection('playlists')
                .createMany(oldPlaylistDocuments);

            await testDatabaseProvider
                .getDatabaseForCollection(ArangoCollectionId.events)
                .createMany([
                    ...existingEvents,
                    ...playlistEventsAlreadyInEventsCollection.map(mapEntityDTOToDatabaseDocument),
                ]);

            await migrationUnderTest.up(testQueryRunner);
        });

        it(`should append the events to the event collection`, async () => {
            const updatedEvents = await testDatabaseProvider
                .getDatabaseForCollection<BaseEvent>(ArangoCollectionId.events)
                .fetchMany();

            await assertEventsMigratedForResource(
                oldSongDocuments,
                songEvents,
                'songs',
                updatedEvents
            );

            await assertEventsMigratedForResource(
                oldTermDocuments,
                termEvents,
                'terms',
                updatedEvents
            );

            await assertEventsMigratedForResource(
                oldVocabularyListDocuments,
                vocabularyListEvents,
                'vocabulary_lists',
                updatedEvents
            );

            await assertEventsMigratedForResource(
                oldAudioItemDocuments,
                audioItemEvents,
                'audio_items',
                updatedEvents
            );

            await assertEventsMigratedForResource(
                oldVideoDocuments,
                videoEvents,
                'videos',
                updatedEvents
            );

            await assertEventsMigratedForResource(
                [
                    playlistWhoseEventsAreAlreadyIncollection,
                    ...playlistsWhoseEventsAreNotInEventsCollection,
                ].map((p) => mapEntityDTOToDatabaseDocument(p.toDTO())),
                playlistEventsNotInEventsCollection,
                'playlists',
                updatedEvents
            );

            /**
             * This ensures that events that were already in the `events` collection
             * in addition to the snapshot are not duplicated.
             */
            expect(updatedEvents).toHaveLength(
                songEvents.length +
                    termEvents.length +
                    vocabularyListEvents.length +
                    audioItemEvents.length +
                    videoEvents.length +
                    existingEvents.length +
                    playlistEventsNotInEventsCollection.length +
                    playlistEventsAlreadyInEventsCollection.length
            );
        });
    });
});
