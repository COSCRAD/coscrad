import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { TagModule } from '../../../../../app/domain-modules/tag.module';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoTagQueryRepository } from '../../repositories/arango-tag-query-repository';
import { ITagQueryRepository } from '../../repositories/tag-query-repository.interface';
import { TagCreatedEventHandler } from './tag-created-event-handler';
import { TagCreated } from './tag-created.event';

const tagId = buildDummyUuid(45);

const taggedLabel = 'label of the tag';

const tagCreatedEvent = buildTestInstance(TagCreated, {
    payload: {
        aggregateCompositeIdentifier: { id: tagId },
        label: taggedLabel,
    },
});

describe(`TagCreatedEventHandler`, () => {
    let testQueryRepository: ITagQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, TagCreatedEventHandler],
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(Environment.test),
                    cache: false,
                }),
                PersistenceModule.forRootAsync(),
                CommandModule,
                TagModule,
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

        await app.init();

        const connectionProvider = app.get(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(connectionProvider);

        testQueryRepository = new ArangoTagQueryRepository(connectionProvider);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();
    });

    describe(`when handling a tag created`, () => {
        it(`should create the tag`, async () => {
            await app.get(TagCreatedEventHandler).handle(tagCreatedEvent);

            const searchResult = await testQueryRepository.fetchById(tagCreatedEvent.id);

            expect(searchResult).toBe(NotFound);
        });
    });
});
