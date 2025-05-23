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
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { ISongQueryRepository } from '../queries/song-query-repository.interface';
import { EventSourcedSongViewModel } from '../queries/song.view-model.event.sourced';
import { ArangoSongQueryRepository } from './arango-song-query-repository';

const audioItemIds = [10, 11, 12].map(buildDummyUuid);

const existingSongWithoutLyrics = buildTestInstance(EventSourcedSongViewModel, {
    lyrics: null,
});

const existingSongs = audioItemIds.map((id) =>
    buildTestInstance(EventSourcedSongViewModel, {
        id,
        name: buildMultilingualTextWithSingleItem(`song #${id}`),
    })
);

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
        const viewToCreate = existingSongs[0];

        it(`should create the expected view`, async () => {
            await testQueryRepository.create(viewToCreate);

            const searchResult = testQueryRepository.fetchById(viewToCreate.id);

            expect(searchResult).not.toBe(NotFound);
        });
    });

    describe(`create many`, () => {
        it(`should create the expected views`, async () => {
            await testQueryRepository.createMany(existingSongs);

            const numberOfViewsFound = await testQueryRepository.count();

            expect(numberOfViewsFound).toBe(existingSongs.length);
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
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(existingSongs);
        });
        describe(`when there are several views`, () => {
            it(`should return them`, async () => {
                const result = await testQueryRepository.fetchMany();

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

        const translationLyrics = 'jajaja';

        beforeEach(async () => {
            await testQueryRepository.create(targetView);
        });

        it(`should translate the lyrics for the given song`, async () => {
            await testQueryRepository.translateLyrics(targetView.id, {
                text: translationLyrics,
                languageCode: translationLanguageCodeForLyrics,
                role: MultilingualTextItemRole.freeTranslation,
            });
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
        });
    });
});
