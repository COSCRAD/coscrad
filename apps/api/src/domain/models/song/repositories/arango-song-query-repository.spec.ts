import {
    EdgeConnectionContextType,
    EdgeConnectionMemberRole,
    LanguageCode,
    MultilingualTextItemRole,
    ResourceType,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TagViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EdgeConnection } from '../../context/edge-connection.entity';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { Tag } from '../../tag/tag.entity';
import { ContributionSummary } from '../../user-management';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from './arango-song-query-repository';

const audioItemIds = [10, 11, 12].map(buildDummyUuid);

const idOfSongToTestInDetail = audioItemIds[0];

const existingSongWithoutLyrics = buildTestInstance(EventSourcedSongViewModel, {
    lyrics: null,
});

const testAcl = new AccessControlList().allowUser(buildDummyUuid(869));

const testContributions = [
    buildTestInstance(ContributionSummary, {
        contributorIds: [44, 45].map(buildDummyUuid),
        type: 'SONG_CREATED',
    }),
];

const existingSongs = audioItemIds.map((id) =>
    buildTestInstance(EventSourcedSongViewModel, {
        id,
        name: buildMultilingualTextWithSingleItem(`song #${id}`),
        isPublished: false,
        accessControlList: testAcl,
        contributions: testContributions,
    })
);

const assertTestSongAsExpected = ({
    name,
    id,
    isPublished,
}: // accessControlList,
// contributions,
EventSourcedSongViewModel) => {
    expect(name.toString()).toEqual(
        buildMultilingualTextWithSingleItem(`song #${idOfSongToTestInDetail}`).toString()
    );

    expect(id).toEqual(idOfSongToTestInDetail);

    expect(isPublished).toEqual(false);

    // TODO[https://coscrad.atlassian.net/browse/CWEBJIRA-76?atlOrigin=eyJpIjoiNjRhMTdkZmVlOWFiNDAxZThmZGZiYmViY2Y5ODE4MTUiLCJwIjoiaiJ9] opt-in
    // expect(accessControlList.toDTO()).toEqual(testAcl.toDTO());

    // expect(contributions).toEqual(testContributions);
};

const textForLyrics = 'my lalala';

const languageCodeForLyrics = LanguageCode.Chilcotin;

const translationLanguageCodeForLyrics = LanguageCode.English;

describe(`ArangoSongQueryRepository`, () => {
    let testQueryRepository: ISongQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync()],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoSongQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('song__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`create`, () => {
        const viewToCreate = existingSongs.find(({ id }) => idOfSongToTestInDetail === id);

        it(`should create the expected view`, async () => {
            await testQueryRepository.create(viewToCreate);

            const searchResult = await testQueryRepository.fetchById(idOfSongToTestInDetail);

            expect(searchResult).not.toBe(NotFound);

            assertTestSongAsExpected(searchResult as EventSourcedSongViewModel);
        });
    });

    describe(`create many`, () => {
        it(`should create the expected views`, async () => {
            await testQueryRepository.createMany(existingSongs);

            const numberOfViewsFound = await testQueryRepository.count();

            expect(numberOfViewsFound).toBe(existingSongs.length);

            const foundViews = await testQueryRepository.fetchMany();

            const viewToTestInDetail = foundViews.find(({ id }) => idOfSongToTestInDetail === id);

            expect(viewToTestInDetail).toBeTruthy();

            assertTestSongAsExpected(viewToTestInDetail);
        });
    });

    describe(`delete`, () => {
        const targetViewForDeletion = existingSongs[1];

        beforeEach(async () => {
            await testQueryRepository.createMany(existingSongs);
        });

        it(`should remove the corresponding view`, async () => {
            await testQueryRepository.delete(targetViewForDeletion.id);

            const searchResult = await testQueryRepository.fetchById(targetViewForDeletion.id);

            expect(searchResult).toBe(NotFound);

            const newCount = await testQueryRepository.count();

            expect(newCount).toBe(existingSongs.length - 1);
        });
    });

    describe(`fetchById`, () => {
        describe(`when there is a song with the given ID`, () => {
            beforeEach(async () => {
                await testQueryRepository.create(existingSongWithoutLyrics);
            });

            it('should find an existing song', async () => {
                const searchResult = await testQueryRepository.fetchById(
                    existingSongWithoutLyrics.id
                );

                expect(searchResult).not.toBe(NotFound);

                const updatedSong = searchResult as EventSourcedSongViewModel;

                expect(updatedSong.name.toString()).toEqual(
                    existingSongWithoutLyrics.name.toString()
                );
            });
        });

        describe(`when there is no song with the given ID`, () => {
            it(`should return not found`, async () => {
                const searchResult = await testQueryRepository.fetchById(buildDummyUuid(666));

                expect(searchResult).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingSongs);
        });
        describe(`when there are several views`, () => {
            it(`should return them`, async () => {
                const result = await testQueryRepository.fetchMany();

                /**
                 * Note that a sanity check is ok here because we do a detailed
                 * assertion in the symmetric `createMany` case.
                 */
                expect(result).toHaveLength(existingSongs.length);
            });
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingSongs);
        });
        describe(`when there are several views`, () => {
            it(`should return them`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(existingSongs.length);
            });
        });
    });

    describe(`publish`, () => {
        const targetSong = existingSongs[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetSong);
        });

        it(`should publish the song`, async () => {
            await testQueryRepository.publish(targetSong.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetSong.id
            )) as EventSourcedSongViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`tag`, () => {
        const existingTagLabel = 'plants';

        const existingTag: TagViewModel = {
            id: buildDummyUuid(90),
            label: existingTagLabel,
            name: buildMultilingualTextWithSingleItem(existingTagLabel),
            members: [],
        };

        const newTagId = buildDummyUuid(91);

        const newTagLabel = 'animals';

        // TODO use event sourced setup?
        const newTag = buildTestInstance(Tag, {
            id: newTagId,
            label: newTagLabel,
        });

        const targetTerm = buildTestInstance(EventSourcedSongViewModel, {
            tags: [existingTag],
        });

        beforeEach(async () => {
            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.tags).clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetTerm);

            /**
             * TODO Remove this. We should seed the tag view in the query database
             * instead.
             */
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.tags)
                .create(mapEntityDTOToDatabaseDocument(newTag.toDTO()));
        });

        it(`should tag the playlist`, async () => {
            await testQueryRepository.tag(targetTerm.id, newTag.id);

            const { tags } = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as EventSourcedSongViewModel;

            expect(tags).toHaveLength(2);

            const tagSearchResult = tags.find(({ id }) => id === newTag.id);

            expect(tagSearchResult).toBeTruthy();

            const { label } = tagSearchResult;

            expect(label).toBe(newTagLabel);
        });
    });

    describe(`createNoteAbout`, () => {
        const targetView = buildTestInstance(EventSourcedSongViewModel, {
            notes: [],
        });

        const targetNote = buildTestInstance(EdgeConnection, {
            members: [
                {
                    compositeIdentifier: {
                        type: ResourceType.song,
                        id: targetView.id,
                    },
                    context: { type: EdgeConnectionContextType.general },
                    role: EdgeConnectionMemberRole.self,
                },
            ],
        });

        beforeEach(async () => {
            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.edgeConnectionCollectionID)
                .clear();

            await databaseProvider.clearViews();

            await testQueryRepository.create(targetView);

            /**
             * Note that there is no need to put the target note in the domain
             * database. The context is passed into the repo update method
             * from the note creation event payload.
             */
        });

        it(`should append a note to the view`, async () => {
            await testQueryRepository.createNoteAbout(targetView.id, {
                noteId: targetNote.id,
                context: targetNote.members[0].context,
                text: targetNote.note,
            });

            const { notes } = (await testQueryRepository.fetchById(
                targetView.id
            )) as EventSourcedSongViewModel;

            expect(notes).toHaveLength(1);

            const { note } = notes[0];

            expect(note.toDTO()).toEqual(targetNote.note.toDTO());
        });
    });

    describe(`allowuser`, () => {
        const targetSong = buildTestInstance(EventSourcedSongViewModel, {
            accessControlList: new AccessControlList(),
        });

        const testUserId = buildDummyUuid(869);

        beforeEach(async () => {
            await testQueryRepository.create(targetSong);
        });

        it(`should add the user to the query ACL`, async () => {
            await testQueryRepository.allowUser(targetSong.id, testUserId);

            const updatedView = (await testQueryRepository.fetchById(
                targetSong.id
            )) as EventSourcedSongViewModel;

            expect(updatedView.accessControlList.canUser(testUserId)).toBe(true);
        });
    });

    describe(`addLyrics`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(existingSongWithoutLyrics);
        });

        it(`should add the lyrics`, async () => {
            await testQueryRepository.addLyrics(
                existingSongWithoutLyrics.id,
                textForLyrics,
                languageCodeForLyrics
            );

            const updatedView = (await testQueryRepository.fetchById(
                existingSongWithoutLyrics.id
            )) as EventSourcedSongViewModel;

            const { lyrics } = updatedView;

            expect(lyrics).toBeTruthy();

            expect(lyrics.hasTranslation()).toBe(false);

            const { text, languageCode } = lyrics.getOriginalTextItem();

            expect(text).toBe(textForLyrics);

            expect(languageCode).toBe(languageCodeForLyrics);
        });
    });

    describe(`translateLyrics`, () => {
        const targetView = buildTestInstance(EventSourcedSongViewModel, {
            lyrics: buildMultilingualTextWithSingleItem(textForLyrics, languageCodeForLyrics),
        });

        const translationOfLyrics = 'jajaja';

        beforeEach(async () => {
            await testQueryRepository.create(targetView);
        });

        it(`should translate the lyrics for the given song`, async () => {
            await testQueryRepository.translateLyrics(targetView.id, {
                text: translationOfLyrics,
                languageCode: translationLanguageCodeForLyrics,
                role: MultilingualTextItemRole.freeTranslation,
            });

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as EventSourcedSongViewModel;

            expect(updatedView.lyrics.has(translationLanguageCodeForLyrics)).toBe(true);

            const { text, role } = updatedView.lyrics.getTranslation(
                translationLanguageCodeForLyrics
            ) as MultilingualTextItem;

            expect(text).toBe(translationOfLyrics);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`translateName`, () => {
        const translationLanguageCode = LanguageCode.English;

        const translationOfName = 'foo bar';

        const targetView = buildTestInstance(EventSourcedSongViewModel, {
            name: buildMultilingualTextWithSingleItem('the song', LanguageCode.Chilcotin),
        });

        beforeEach(async () => {
            await testQueryRepository.create(targetView);
        });

        it(`should translate the name`, async () => {
            await testQueryRepository.translateName(targetView.id, {
                text: translationOfName,
                languageCode: translationLanguageCode,
                role: MultilingualTextItemRole.freeTranslation,
            });

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as EventSourcedSongViewModel;

            expect(updatedView.name.has(translationLanguageCode)).toBe(true);

            const { text, role } = updatedView.name.getTranslation(
                translationLanguageCode
            ) as MultilingualTextItem;

            expect(text).toBe(translationOfName);

            expect(role).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });
});
