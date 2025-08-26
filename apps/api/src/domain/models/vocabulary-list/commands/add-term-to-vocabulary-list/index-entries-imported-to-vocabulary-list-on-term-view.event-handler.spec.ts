import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import { isDeepStrictEqual } from 'util';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { VocabularyListViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/vocabulary-list.view-model';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ITermQueryRepository } from '../../../term/queries/term-query-repository.interface';
import { ArangoTermQueryRepository } from '../../../term/repositories';
import { IVocabularyListQueryRepository } from '../../queries/vocabulary-list-query-repository.interface';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { EntriesImportedToVocabularyList } from '../import-entries-to-vocabulary-list';
import { IndexEntriesImportedToVocabularyListOnTermViewEventHandler } from './index-entries-imported-to-vocabulary-list-on-term-view.event-handler';

let _foo: IndexEntriesImportedToVocabularyListOnTermViewEventHandler;

const vocabularyListId = buildDummyUuid(99);

const vocabularyListView = buildTestInstance(VocabularyListViewModel, {
    id: vocabularyListId,
    entries: [],
});

const termIds = [1, 2, 3].map(buildDummyUuid);

const existingTermViews = termIds.map((id) =>
    buildTestInstance(TermViewModel, {
        id,
    })
);

const PROPERTY_NAME = 'number';

const entriesImportedEvent = buildTestInstance(EntriesImportedToVocabularyList, {
    payload: {
        entries: existingTermViews.map(({ id: termId }, index) => ({
            termId,
            propertyValues: {
                [PROPERTY_NAME]: (index + 1).toString(),
            },
        })),
    },
});

describe('IndexEntriesImportedToVocabularyListOnTermViewEventHandler', () => {
    let testVocabularyListQueryRepository: IVocabularyListQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let eventHandler: IndexEntriesImportedToVocabularyListOnTermViewEventHandler;

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

        testVocabularyListQueryRepository = new ArangoVocabularyListQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        termQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        eventHandler = new IndexEntriesImportedToVocabularyListOnTermViewEventHandler(
            termQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        await termQueryRepository.createMany(existingTermViews);

        await testVocabularyListQueryRepository.create(vocabularyListView);
    });

    describe(`when all terms exist`, () => {
        it(`should add the vocabulary list to all term views`, async () => {
            await eventHandler.handle(entriesImportedEvent);

            const updatedViews = await termQueryRepository.fetchMany();

            const invalidResults = updatedViews.filter(({ vocabularyLists }) => {
                if (
                    vocabularyLists.length !== 1 ||
                    !vocabularyLists.some(
                        ({ id, name }) =>
                            id === vocabularyListId &&
                            isDeepStrictEqual(name.toDTO(), vocabularyListView.name.toDTO())
                    )
                ) {
                    return false;
                }

                return true;
            });

            expect(invalidResults).toEqual([]);
        });
    });
});
