import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { isNullOrUndefined } from '@coscrad/validation-constraints';
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
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { PlaylistViewModel } from '../../../../queries/buildViewModelForResource/viewModels/playlist.view-model';
import { buildTestInstance } from '../../../../test-data/utilities';
import { buildMultilingualTextFromBilingualText } from '../../../common/build-multilingual-text-from-bilingual-text';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import idEquals from '../../shared/functional/idEquals';
import { CoscradContributor } from '../../user-management';
import { ArangoPlaylistQueryRepository } from './arango-playlist-query-repository';
import { IPlaylistQueryRepository } from './playlist-query-repository.interface';

const playlistIds = [1, 2, 3].map(buildDummyUuid);

const playlistViews = playlistIds.map((id, index) =>
    buildTestInstance(PlaylistViewModel, {
        id,
        name: buildMultilingualTextFromBilingualText(
            { text: `playlist #${index + 1}`, languageCode: LanguageCode.Chilcotin },
            { text: `playlist #${index + 1} (translation)`, languageCode: LanguageCode.English }
        ),
        episodes: [],
    })
);

const targetPlaylist = playlistViews[0];

const targetPlaylistId = targetPlaylist.id;

const audioItemIds = [55, 56, 57].map(buildDummyUuid);

const mediaItemIds = [66, 67, 68].map(buildDummyUuid);

const existingAudioItems = audioItemIds.map((id, index) =>
    buildTestInstance(EventSourcedAudioItemViewModel, {
        id,
        mediaItemId: mediaItemIds[index],
    })
);

const existingAudioItem = existingAudioItems[0];

describe(`ArangoPlaylistQueryRepository`, () => {
    let testQueryRepository: IPlaylistQueryRepository;

    let audioItemQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let contributorRepository: IRepositoryForAggregate<CoscradContributor>;

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

        // TODO Use the DI system so this is more extensible to keep test maintenance lower
        audioItemQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        testQueryRepository = new ArangoPlaylistQueryRepository(
            connectionProvider
            // new ConsoleCoscradCliLogger()
        );

        /**
         * Currently, the contributors are snapshot based (not event sourced).
         */
        contributorRepository = new ArangoRepositoryForAggregate(
            databaseProvider,
            ArangoCollectionId.contributors,
            buildInstanceFactory(CoscradContributor),
            mapDatabaseDocumentToAggregateDTO,
            mapEntityDTOToDatabaseDocument
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`fetchById`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(playlistViews);
        });

        describe(`when there is a view with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetPlaylistId);

                expect(result).not.toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(playlistViews);
        });

        describe(`when there are several views`, () => {
            it(`should return them`, async () => {
                const result = await testQueryRepository.fetchMany();

                expect(result).toHaveLength(playlistViews.length);
            });
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(playlistViews);
        });

        describe(`when there are several views`, () => {
            it(`should return them`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(playlistViews.length);
            });
        });
    });

    describe(`addAudioItem`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.createMany(playlistViews);

            await audioItemQueryRepository.create(existingAudioItem);
        });

        it(`should add the correct episode to the playlist`, async () => {
            await testQueryRepository.addAudioItem(targetPlaylist.id, existingAudioItem.id);

            const { episodes } = (await testQueryRepository.fetchById(
                targetPlaylist.id
            )) as PlaylistViewModel;

            expect(episodes).toHaveLength(1);

            const { mediaItemId, name } = episodes[0];

            expect(mediaItemId).toBe(existingAudioItem.mediaItemId);

            expect(name).toEqual(existingAudioItem.name);
        });
    });

    describe(`translatePlaylistName`, () => {
        const translationLanguageCode = LanguageCode.English;

        const translationText = 'translation of the text';

        const targetPlaylist = buildTestInstance(PlaylistViewModel, {
            name: buildMultilingualTextWithSingleItem('existing name', LanguageCode.Chilcotin),
        });

        beforeEach(async () => {
            // ARRANGE
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetPlaylist);
        });

        it(`should translate the given playlist's name`, async () => {
            // ACT
            await testQueryRepository.translatePlaylistName(
                targetPlaylist.id,
                translationText,
                translationLanguageCode
            );

            // ASSERT
            const updatedView = (await testQueryRepository.fetchById(
                targetPlaylist.id
            )) as PlaylistViewModel;

            const { name } = updatedView;

            expect(name.has(translationLanguageCode)).toBe(true);

            const translationItemSearchResult = name.getTranslation(translationLanguageCode);

            expect(translationItemSearchResult).not.toBe(NotFound);

            const { text: foundTranslationText, role: foundRole } =
                translationItemSearchResult as MultilingualTextItem;

            expect(foundTranslationText).toBe(translationText);

            expect(foundRole).toBe(MultilingualTextItemRole.freeTranslation);
        });
    });

    describe(`importAudioItems`, () => {
        const targetPlaylist = buildTestInstance(PlaylistViewModel, {
            id: buildDummyUuid(4),
        });

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetPlaylist);

            await audioItemQueryRepository.createMany(existingAudioItems);
        });

        it(`should import the audio items to a playlist`, async () => {
            await testQueryRepository.importAudioItems(targetPlaylist.id, audioItemIds);

            const updatedView = (await testQueryRepository.fetchById(
                targetPlaylist.id
            )) as PlaylistViewModel;

            const invalidItems = updatedView.episodes.filter(
                ({ name, mediaItemId, isPublished, accessControlList }) => {
                    const targetAudioItem = existingAudioItems.find(
                        (audioItem) => audioItem.mediaItemId === mediaItemId
                    );

                    if (isNullOrUndefined(targetAudioItem)) {
                        //. this item is missing a corresponding auto
                        return true;
                    }

                    if (name.toString() !== targetAudioItem.name.toString()) {
                        // the name is incorrect
                        return true;
                    }

                    if (isPublished !== targetAudioItem.isPublished) {
                        // wrong publication status
                        return true;
                    }

                    if (`${accessControlList}` !== `${targetAudioItem.accessControlList}`) {
                        // invalid ACL
                        return true;
                    }

                    // !!valid, i.e., valid
                    return false;
                }
            );

            expect(invalidItems).toEqual([]);

            expect(updatedView.episodes).toHaveLength(existingAudioItems.length);
        });
    });

    describe(`attribute`, () => {
        const testContributors = [buildTestInstance(CoscradContributor, {})];

        const targetView = playlistViews[0];

        beforeEach(async () => {
            await databaseProvider.clearViews();

            await testQueryRepository.create(targetView);

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.contributors)
                .clear();

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the expected attributions for contributors`, async () => {
            await testQueryRepository.attribute(
                targetView.id,
                testContributors.map(({ id }) => id)
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as PlaylistViewModel;

            const { contributions } = updatedView;

            expect(contributions).toHaveLength(testContributors.length);

            const missingContributions = contributions.filter(
                ({ id: foundContributorId }) => !testContributors.some(idEquals(foundContributorId))
            );

            expect(missingContributions).toEqual([]);
        });
    });
});
