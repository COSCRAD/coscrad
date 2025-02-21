import {
    AggregateType,
    IDetailQueryResult,
    IPhotographViewModel,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { PhotographViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/photograph.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { PhotographCommandsModule } from '../../photograph.commands.module';
import { IPhotographQueryRepository } from '../../queries';
import { ArangoPhotographQueryRepository } from '../../repositories';
import { PhotographCreated } from './photograph-created.event';
import { PhotographCreatedEventHandler } from './photograph-created.event-handler';

const photographTitle = 'photo one test title';

const languageCode = LanguageCode.Haida;

const photographId = buildDummyUuid(1);

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const photographCreated = new TestEventStream()
    .andThen<PhotographCreated>({
        type: 'PHOTOGRAPH_CREATED',
        payload: {
            title: photographTitle,
            languageCodeForTitle: languageCode,
        },
        meta: {
            contributorIds: [dummyContributor.id],
        },
    })
    .as({
        id: photographId,
        type: AggregateType.photograph,
    })[0]; // There is only one event in this stream, which is the target event

describe(`PhotographCreatedEventHandler`, () => {
    let testQueryRepository: IPhotographQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<IPhotographViewModel>
    >;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, PhotographCreatedEventHandler],
            imports: [PersistenceModule.forRootAsync(), CommandModule, PhotographCommandsModule],
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

        arangoDatabaseForCollection =
            databaseProvider.getDatabaseForCollection('photograph__VIEWS');

        testQueryRepository = new ArangoPhotographQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when handling a photograph created event`, () => {
        beforeEach(async () => {
            await arangoDatabaseForCollection.clear();
        });

        it(`should create the expected view in the database`, async () => {
            const handler = app.get(PhotographCreatedEventHandler);

            // @ts-expect-error Fix this issue
            await handler.handle(photographCreated);

            const searchResult = await testQueryRepository.fetchById(photographId);

            expect(searchResult).not.toBe(NotFound);

            const foundPhotograph = searchResult as PhotographViewModel;

            const { name: nameDto, contributions, actions } = foundPhotograph;

            const name = new MultilingualText(nameDto);

            const originalPhotographTitleItem = name.getOriginalTextItem();

            expect(originalPhotographTitleItem.text).toBe(photographTitle);

            expect(originalPhotographTitleItem.languageCode).toBe(languageCode);

            expect(actions).toContain('TAG_RESOURCE');
            expect(actions).toContain('CREATE_NOTE_ABOUT_RESOURCE');
            expect(actions).toContain('CONNECT_RESOURCES_WITH_NOTE');
            expect(actions).toContain('PUBLISH_RESOURCE');

            // expect tags to be empty
            // expect categories to be empty
            // expect notes to be empty

            expect(
                contributions.some(
                    // this should actually be the name and ID
                    (c) => c.id === dummyContributor.id
                )
            );

            // TODO check the contributor's full name as well
        });
    });
});
