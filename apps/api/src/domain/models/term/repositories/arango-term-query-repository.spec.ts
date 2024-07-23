import {
    AggregateType,
    IDetailQueryResult,
    ITermViewModel,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/Environment';
import { InternalError } from '../../../../lib/errors/InternalError';
import { isNotFound, NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../persistence/database/arango-database-for-collection';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { TermViewModel } from '../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../common/build-multilingual-text-with-single-item';
import { MultilingualText, MultilingualTextItem } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../../audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { EventSourcedAudioItemViewModel } from '../../audio-visual/audio-item/queries';
import { IAudioItemQueryRepository } from '../../audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ArangoAudioItemQueryRepository } from '../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { ITermQueryRepository } from '../queries/term-query-repository.interface';
import { ArangoTermQueryRepository } from './arango-term-query-repository';

describe(`ArangoTermQueryRepository`, () => {
    let testQueryRepository: ITermQueryRepository;

    let audioItemQueryRepository: IAudioItemQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

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
                        // TODO this shouldn't be necessary
                        ARANGO_DB_HOST_PORT: 8551,
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await moduleRef.init();

        app = moduleRef.createNestApplication();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        arangoDatabaseForCollection = databaseProvider.getDatabaseForCollection('term__VIEWS');

        // TODO Use the DI system so this is more extensible to keep test maintenance lower
        audioItemQueryRepository = new ArangoAudioItemQueryRepository(connectionProvider);

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            audioItemQueryRepository
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

    const termIds = [1, 2, 3].map(buildDummyUuid);

    const buildTermText = (id: string) => `term ${id}`;

    const termText = buildTermText(termIds[0]);

    const originalLanguageCode = LanguageCode.Chilcotin;

    const translationLangaugeCode = LanguageCode.English;

    const textTranslation = 'foobar';

    const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

    const contributorIds = [101, 102, 103].map(buildDummyUuid);

    const contributorIdsAndNames = contributorIds.map((contributorId) => ({
        contributorId,
        fullName: new FullName({
            firstName: `user`,
            lastName: contributorId,
        }),
    }));

    const testContributors = contributorIdsAndNames.map(({ contributorId, fullName }) =>
        dummyContributor.clone({
            id: contributorId,
            fullName,
        })
    );

    const termViews = termIds.map((id) => ({
        id,
        contributions: [],
        name: buildMultilingualTextWithSingleItem(buildTermText(id), originalLanguageCode),
        actions: [],
        isPublished: false,
        accessControlList: new AccessControlList(),
    }));

    describe(`fetchById`, () => {
        const targetTermId = termIds[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(termViews[0]);
        });

        describe(`when there is a term with the given ID`, () => {
            it(`should return the expected view`, async () => {
                const result = await testQueryRepository.fetchById(targetTermId);

                expect(result).not.toBe(NotFound);

                const { name } = result as IDetailQueryResult<ITermViewModel>;

                const foundOriginalTextForTerm = name.items.find(
                    ({ languageCode }) => languageCode === originalLanguageCode
                ).text;

                expect(foundOriginalTextForTerm).toBe(termText);
            });
        });

        describe(`when there is no term with the given ID`, () => {
            it(`should return not found`, async () => {
                const result = await testQueryRepository.fetchById('BOGUS_123');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            for (const term of termViews) {
                await testQueryRepository.create(term);
            }
        });

        it(`should return the expected term views`, async () => {
            const result = await testQueryRepository.fetchMany();

            expect(result).toHaveLength(termViews.length);
        });
    });

    describe(`count`, () => {
        describe(`when there are term views in the database`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                for (const term of termViews) {
                    await testQueryRepository.create(term);
                }
            });

            it(`should return the expected result`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(termViews.length);
            });
        });

        describe(`when the database collection is empty`, () => {
            beforeEach(async () => {
                await arangoDatabaseForCollection.clear();

                // no terms are added here
            });

            it(`should return 0`, async () => {
                const result = await testQueryRepository.count();

                expect(result).toBe(0);
            });
        });
    });

    describe(`translate`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetTerm);
        });

        it(`should append the expected multilingual text item`, async () => {
            const targetTranslationRole = MultilingualTextItemRole.freeTranslation;

            await testQueryRepository.translate(targetTerm.id, {
                text: textTranslation,
                languageCode: translationLangaugeCode,
                role: targetTranslationRole,
            });

            const updatedTerm = await testQueryRepository.fetchById(targetTerm.id);

            if (isNotFound(updatedTerm)) {
                expect(updatedTerm).not.toBe(NotFound);

                throw new InternalError('test failed');
            }

            const updatedName = new MultilingualText(updatedTerm.name); // we want an instance (not a DTO) for the query methods

            const searchResultForTranslation = updatedName.getTranslation(translationLangaugeCode);

            expect(searchResultForTranslation).not.toBe(NotFound);

            const foundTranslation = searchResultForTranslation as MultilingualTextItem;

            expect(foundTranslation.text).toBe(textTranslation);

            expect(foundTranslation.role).toBe(targetTranslationRole);
        });
    });

    describe(`addAudio`, () => {
        const targetTerm = termViews[0];

        const audioItemId = buildDummyUuid(55);

        const mediaItemId = buildDummyUuid(56);

        const audioCreationEvent = new TestEventStream()
            .andThen<AudioItemCreated>({
                type: 'AUDIO_ITEM_CREATED',
                payload: {
                    mediaItemId,
                },
            })
            .as({
                type: AggregateType.audioItem,
                id: audioItemId,
            })[0] as AudioItemCreated;

        const targetAudioItemView =
            EventSourcedAudioItemViewModel.fromAudioItemCreated(audioCreationEvent);

        beforeEach(async () => {
            // clear existing term views
            await arangoDatabaseForCollection.clear();

            // clear existing audio item views
            databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();

            await testQueryRepository.create(targetTerm);

            await audioItemQueryRepository.create(targetAudioItemView);
        });

        it(`should append the audio item`, async () => {
            await testQueryRepository.addAudio(targetTerm.id, originalLanguageCode, audioItemId);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as IDetailQueryResult<ITermViewModel>;

            // TODO In the future, we should use multilingual audio for terms
            expect(updatedView.mediaItemId).toBe(mediaItemId);
        });
    });

    describe(`allowUser`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            // clear existing term views
            await arangoDatabaseForCollection.clear();

            // clear existing audio item views

            await testQueryRepository.create(targetTerm);
        });

        it(`should add the user to the ACL`, async () => {
            const userId = buildDummyUuid(456);

            await testQueryRepository.allowUser(targetTerm.id, userId);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            const updatedAcl = new AccessControlList(updatedView.accessControlList);

            const canUser = updatedAcl.canUser(userId);

            expect(canUser).toBe(true);
        });
    });

    describe(`delete`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(termViews);
        });

        it(`should remove the given term`, async () => {
            const targetTermViewId = termIds[0];

            const expectedNumberOfTermsAfterDelete = termViews.length - 1;

            await testQueryRepository.delete(targetTermViewId);

            const actualNumberOfTerms = await testQueryRepository.count();

            expect(actualNumberOfTerms).toBe(expectedNumberOfTermsAfterDelete);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.createMany(termViews);
        });

        it(`should return the correct count`, async () => {
            const result = await testQueryRepository.count();

            expect(result).toBe(termViews.length);
        });
    });

    describe(`create`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the correct term view`, async () => {
            const termToCreate = termViews[0];

            // act
            await testQueryRepository.create(termToCreate);

            const searchResult = await testQueryRepository.fetchById(termToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            const foundTermView = searchResult as TermViewModel;

            const name = new MultilingualText(foundTermView.name);

            expect(name.getOriginalTextItem().text).toBe(termText);
        });
    });

    describe(`createMany`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the expected term views`, async () => {
            // act
            await testQueryRepository.createMany(termViews);

            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(termViews.length);
        });
    });

    describe('publish', () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await testQueryRepository.create(targetTerm);
        });

        it(`should publish the given term`, async () => {
            await testQueryRepository.publish(targetTerm.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`attribute`, () => {
        const targetTerm = termViews[0];

        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();

            await databaseProvider.getDatabaseForCollection('contributors').clear();

            await testQueryRepository.create(targetTerm);

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the given contributions`, async () => {
            await testQueryRepository.attribute(
                targetTerm.id,
                testContributors.map((c) => c.id)
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetTerm.id
            )) as TermViewModel;

            const missingAttributions = updatedView.contributions.filter(
                ({ id }) => !contributorIds.includes(id)
            );

            expect(missingAttributions).toHaveLength(0);

            const { contributorId: targetContributorId, fullName: expectedFullName } =
                contributorIdsAndNames[0];

            const contributionForFirstUser = updatedView.contributions.find(
                ({ id }) => id === targetContributorId
            );

            expect(contributionForFirstUser.fullName).toBe(
                `${expectedFullName.firstName} ${expectedFullName.lastName}`
            );
        });
    });
});
