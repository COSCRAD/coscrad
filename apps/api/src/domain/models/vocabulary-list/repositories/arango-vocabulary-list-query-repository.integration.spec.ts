import { AggregateType, IVocabularyListViewModel, LanguageCode } from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../coscrad-cli/logging';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import mapDatabaseDocumentToAggregateDTO from '../../../../persistence/database/utilities/mapDatabaseDocumentToAggregateDTO';
import mapEntityDTOToDatabaseDocument from '../../../../persistence/database/utilities/mapEntityDTOToDatabaseDocument';
import { PersistenceModule } from '../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoRepositoryForAggregate } from '../../../../persistence/repositories/arango-repository-for-aggregate';
import { EventSourcedVocabularyListViewModel } from '../../../../queries/buildViewModelForResource/viewModels';
import { TestEventStream } from '../../../../test-data/events';
import getValidAggregateInstanceForTest from '../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../common/entities/multilingual-text';
import buildInstanceFactory from '../../../factories/utilities/buildInstanceFactory';
import { IRepositoryForAggregate } from '../../../repositories/interfaces/repository-for-aggregate.interface';
import { AggregateId } from '../../../types/AggregateId';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { AccessControlList } from '../../shared/access-control/access-control-list.entity';
import idEquals from '../../shared/functional/idEquals';
import { CoscradContributor } from '../../user-management/contributor';
import { FullName } from '../../user-management/user/entities/user/full-name.entity';
import { VocabularyListCreated } from '../commands';
import { IVocabularyListQueryRepository } from '../queries';
import { ArangoVocabularyListQueryRepository } from './arango-vocabulary-list-query-repository';

const vocabularyListIds = [123, 124, 125].map(buildDummyUuid);

const originalLanguageCode = LanguageCode.Chilcotin;

const buildVocabularyListEventHistory = (
    id: AggregateId,
    name: string,
    languageCodeForName: LanguageCode
) => {
    const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
        type: 'VOCABULARY_LIST_CREATED',
        payload: {
            name,
            languageCodeForName,
        },
    });

    return vocabularyListCreated.as({
        type: AggregateType.vocabularyList,
        id,
    });
};

const buildVocabularyListName = (id: AggregateId) => `vocabulary list #${id}`;

const vocabularyListViews = vocabularyListIds.map((id) => {
    const eventHistory = buildVocabularyListEventHistory(
        id,
        buildVocabularyListName(id),
        originalLanguageCode
    );

    const creationEvent = eventHistory[0] as VocabularyListCreated;

    return EventSourcedVocabularyListViewModel.fromVocabularyListCreated(creationEvent);
});

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

describe(`ArangoVocabularyListQueryRepository`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

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

        testQueryRepository = new ArangoVocabularyListQueryRepository(
            databaseProvider,
            new ConsoleCoscradCliLogger()
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

    beforeEach(async () => {
        // clear existing contributors
        await databaseProvider.getDatabaseForCollection(ArangoCollectionId.contributors).clear();

        await databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();
    });

    describe(`fetchById`, () => {
        describe(`when there is a vocabulary list with the given ID`, () => {
            const targetVocabularyListView = vocabularyListViews[0];

            beforeEach(async () => {
                await testQueryRepository.createMany(vocabularyListViews);
            });

            it(`should return the expected result`, async () => {
                // act
                const result = await testQueryRepository.fetchById(targetVocabularyListView.id);

                expect(result).not.toBe(NotFound);

                const foundView = result as EventSourcedVocabularyListViewModel;

                const foundName = new MultilingualText(foundView.name);

                const { text: foundTextForName, languageCode: foundLanguageCodeForName } =
                    foundName.getOriginalTextItem();

                expect(foundTextForName).toBe(buildVocabularyListName(targetVocabularyListView.id));

                expect(foundLanguageCodeForName).toBe(originalLanguageCode);
            });
        });

        describe(`when there is no vocabulary list with the given ID`, () => {
            it(`should return NotFound`, async () => {
                const result = await testQueryRepository.fetchById('bogusId');

                expect(result).toBe(NotFound);
            });
        });
    });

    describe(`fetchMany`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should return the expected views`, async () => {
            const foundViews = await testQueryRepository.fetchMany();

            expect(foundViews).toHaveLength(vocabularyListViews.length);

            const missingViews = vocabularyListViews.filter(
                ({ id: testDataId }) => !foundViews.some(({ id }) => id === testDataId)
            );

            expect(missingViews).toEqual([]);
        });
    });

    describe(`count`, () => {
        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should return the expected views`, async () => {
            const actualCount = await testQueryRepository.count();

            expect(actualCount).toBe(vocabularyListViews.length);
        });
    });

    describe(`create`, () => {
        const viewToCreate = vocabularyListViews[0];

        it(`should create the expected view`, async () => {
            await testQueryRepository.create(viewToCreate);

            const searchResult = testQueryRepository.fetchById(viewToCreate.id);

            expect(searchResult).not.toBe(NotFound);

            // Should we check this in more detail?
        });
    });

    describe(`create many`, () => {
        it(`should create the expected views`, async () => {
            await testQueryRepository.createMany(vocabularyListViews);

            const numberOfViewsFound = await testQueryRepository.count();

            expect(numberOfViewsFound).toBe(vocabularyListIds.length);
        });
    });

    describe(`delete`, () => {
        const targetViewForDeleition = vocabularyListViews[1];

        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should remove the corresponding view`, async () => {
            await testQueryRepository.delete(targetViewForDeleition.id);

            const searchResult = await testQueryRepository.fetchById(targetViewForDeleition.id);

            expect(searchResult).toBe(NotFound);

            const newcount = await testQueryRepository.count();

            // we've removed 1 document
            expect(newcount).toBe(vocabularyListViews.length - 1);
        });
    });

    describe(`publish`, () => {
        const viewToPublish = vocabularyListViews[0];

        beforeEach(async () => {
            await testQueryRepository.createMany(vocabularyListViews);
        });

        it(`should publish the given view`, async () => {
            await testQueryRepository.publish(viewToPublish.id);

            const updatedView = (await testQueryRepository.fetchById(viewToPublish.id)) as {
                isPublished: boolean;
            };

            expect(updatedView.isPublished).toBe(true);
        });
    });

    describe(`allow user`, () => {
        const targetView = vocabularyListViews[0];

        const user = getValidAggregateInstanceForTest(AggregateType.user);

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await databaseProvider.getDatabaseForCollection(ArangoCollectionId.users).clear();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.users)
                .create(mapEntityDTOToDatabaseDocument(user));
        });

        it(`should allow the given user`, async () => {
            await testQueryRepository.allowUser(targetView.id, user.id);

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as IVocabularyListViewModel;

            const acl = new AccessControlList(updatedView.accessControlList);

            expect(acl.canUser(user.id)).toBe(true);
        });
    });

    /**
     * TODO We should remove this in favour of making the attribution atomic
     * with each update write.
     */
    describe(`attribute`, () => {
        const targetView = vocabularyListViews[0];

        beforeEach(async () => {
            await testQueryRepository.create(targetView);

            await contributorRepository.createMany(testContributors);
        });

        it(`should add the expected attributions for contributors`, async () => {
            await testQueryRepository.attribute(
                targetView.id,
                testContributors.map(({ id }) => id)
            );

            const updatedView = (await testQueryRepository.fetchById(
                targetView.id
            )) as IVocabularyListViewModel;

            const { contributions } = updatedView;

            expect(contributions).toHaveLength(testContributors.length);

            const missingContributions = contributions.filter(
                ({ id: foundContributorId }) => !testContributors.some(idEquals(foundContributorId))
            );

            expect(missingContributions).toEqual([]);
        });
    });
});
