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
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { PromptTermCreated } from './prompt-term-created.event';
import { PromptTermCreatedEventHandler } from './prompt-term-created.event-handler';

const termId = buildDummyUuid(1);

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const creationEvent = new TestEventStream()
    .andThen<PromptTermCreated>({
        type: 'PROMPT_TERM_CREATED',
        meta: {
            contributorIds: [dummyContributor.id],
        },
    })
    .as({
        type: AggregateType.term,
        id: termId,
    })[0] as PromptTermCreated;

describe(`PromptTermCreatedEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

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

        testQueryRepository = new ArangoTermQueryRepository(connectionProvider);
    });

    beforeEach(async () => {
        await arangoDatabaseForCollection.clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    it(`should create the correct term in the database`, async () => {
        await new PromptTermCreatedEventHandler(testQueryRepository).handle(
            creationEvent as PromptTermCreated
        );

        const searchResult = await testQueryRepository.fetchById(termId);

        expect(searchResult).not.toBe(NotFound);

        const termView = searchResult as TermViewModel;

        expect(termView.contributions).toEqual([dummyContributor.id]);

        const name = new MultilingualText(termView.name);

        const originalTextItemForName = name.getOriginalTextItem();

        expect(originalTextItemForName.text).toBe(creationEvent.payload.text);

        expect(originalTextItemForName.languageCode).toBe(LanguageCode.English);

        expect(originalTextItemForName.role).toBe(MultilingualTextItemRole.original);
    });
});
