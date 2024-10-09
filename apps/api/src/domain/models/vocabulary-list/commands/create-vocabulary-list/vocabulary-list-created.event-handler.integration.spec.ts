import {
    AggregateType,
    IDetailQueryResult,
    IVocabularyListViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { IVocabularyListQueryRepository } from '../../queries';
import { ArangoVocabularyListQueryRepository } from '../../repositories';
import { VocabularyListCreated } from './vocabulary-list-created.event';
import { VocabularyListCreatedEventHandler } from './vocabulary-list-created.event-handler';

const vocabularyListId = buildDummyUuid(111);

const vocabularyListName = 'test vocab list';

const originalLanguageCode = LanguageCode.Chilcotin;

const vocabularyListCreated = new TestEventStream().andThen<VocabularyListCreated>({
    type: 'VOCABULARY_LIST_CREATED',
    payload: {
        name: vocabularyListName,
        languageCodeForName: originalLanguageCode,
    },
});

const creationEvent = vocabularyListCreated.as({
    type: AggregateType.vocabularyList,
    id: vocabularyListId,
})[0] as VocabularyListCreated;

describe(`VocabularyListCreatedEventHandler`, () => {
    let testQueryRepository: IVocabularyListQueryRepository;

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
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('vocabularyList__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when there is a valid creation event`, () => {
        it(`should create the expected vocabulary list`, async () => {
            await new VocabularyListCreatedEventHandler(testQueryRepository).handle(creationEvent);

            const searchResult = await testQueryRepository.fetchById(vocabularyListId);

            expect(searchResult).not.toBe(NotFound);

            const view = searchResult as IDetailQueryResult<IVocabularyListViewModel>;

            const foundName = new MultilingualText(view.name);

            const { text: foundTextForName, languageCode: foundLanguageCodeForName } =
                foundName.getOriginalTextItem();

            expect(foundTextForName).toBe(vocabularyListName);

            expect(foundLanguageCodeForName).toBe(originalLanguageCode);
        });
    });
});
