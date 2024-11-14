import { AggregateType } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigService from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/Environment';
import { TermModule } from '../app/domain-modules/term.module';
import { UserManagementModule } from '../app/domain-modules/user-management.module';
import { CoscradEventFactory, EventModule } from '../domain/common';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../domain/models/audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ResourcePublished } from '../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { TermCreated, TermTranslated } from '../domain/models/term/commands';
import { ArangoTermQueryRepository } from '../domain/models/term/repositories/arango-term-query-repository';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../test-data/events';
import { DynamicDataTypeFinderService } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { ConsoleCoscradCliLogger, COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const translatedTermId = buildDummyUuid(1);

const translatedTermPublished = new TestEventStream()
    .andThen<TermCreated>({
        type: 'TERM_CREATED',
    })
    .andThen<TermTranslated>({
        type: 'TERM_TRANSLATED',
    })
    .andThen<ResourcePublished>({
        type: 'RESOURCE_PUBLISHED',
    });

const eventHistoryForTranslatedTerm = translatedTermPublished.as({
    type: AggregateType.term,
    id: translatedTermId,
});

const CLI_COMMAND_NAME = 'rehydrate-views';

/**
 * TODO Investigate network issues with this test.
 */
describe.skip(`CLI Command: **${CLI_COMMAND_NAME}**`, () => {
    let commandInstance: TestingModule;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let termQueryRepository: ArangoTermQueryRepository;

    let audioQueryRepository: ArangoAudioItemQueryRepository;

    const mockLogger = buildMockLogger({ isEnabled: true });

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                CommandModule,
                EventModule,
                UserManagementModule,
                TermModule,
            ],
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

        const arangoConnectionProvider =
            app.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        audioQueryRepository = new ArangoAudioItemQueryRepository(arangoConnectionProvider);

        termQueryRepository = new ArangoTermQueryRepository(
            arangoConnectionProvider,
            audioQueryRepository,
            new ConsoleCoscradCliLogger()
        );

        testRepositoryProvider = new TestRepositoryProvider(
            databaseProvider,
            app.get(CoscradEventFactory),
            app.get(DynamicDataTypeFinderService)
        );

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(app)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            // TODO why is this necessary?
            .overrideProvider(ArangoConnectionProvider)
            .useValue(app.get(ArangoConnectionProvider))
            .compile();
    });

    describe(`when all views are to be rehydrated`, () => {
        beforeEach(async () => {
            await testRepositoryProvider.testSetup();

            await databaseProvider.getDatabaseForCollection('term__VIEWS').clear();

            await databaseProvider.getDatabaseForCollection('audioItem__VIEWS').clear();

            await testRepositoryProvider
                .getEventRepository()
                .appendEvents(eventHistoryForTranslatedTerm);
        });

        it('should succeed', async () => {
            await CommandTestFactory.run(commandInstance, [CLI_COMMAND_NAME]);

            const numberOfTermsCreated = await termQueryRepository.count();

            expect(numberOfTermsCreated).toEqual(1);
        });
    });
});
