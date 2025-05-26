import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/environment';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
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
