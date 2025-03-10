import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/Environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TestEventStream } from '../../../../../test-data/events';
import { assertResourceHasContributionFor } from '../../../__tests__';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { IPhotographQueryRepository } from '../../queries';
import { PhotographViewModel } from '../../queries/photograph.view-model';
import { ArangoPhotographQueryRepository } from '../../repositories';
import { PhotographCommandsModule } from '../photograph.commands.module';
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

    // let arangoDatabaseForCollection: ArangoDatabaseForCollection<
    //     IDetailQueryResult<IPhotographViewModel>
    // >;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            // providers: [CommandInfoService, PhotographCreatedEventHandler],
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

        // arangoDatabaseForCollection =
        //     databaseProvider.getDatabaseForCollection('photograph__VIEWS');

        testQueryRepository = new ArangoPhotographQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );
    });

    beforeEach(async () => {
        await databaseProvider.getDatabaseForCollection('photograph__VIEWS').clear();
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when handling a photograph created event`, () => {
        it(`should create the expected photograph`, async () => {
            // const handler = app.get(PhotographCreatedEventHandler);

            // @ts-expect-error Fix this issue
            // await handler.handle(photographCreated);

            await new PhotographCreatedEventHandler(testQueryRepository).handle(photographCreated);

            const searchResult = await testQueryRepository.fetchById(photographId);

            expect(searchResult).not.toBe(NotFound);

            const view = searchResult as PhotographViewModel;

            const { name: nameDto, actions } = view;

            const foundName = new MultilingualText(nameDto);

            const originalPhotographTitleItem = foundName.getOriginalTextItem();

            expect(originalPhotographTitleItem.text).toBe(photographTitle);

            expect(originalPhotographTitleItem.languageCode).toBe(languageCode);

            expect(actions).toContain('TAG_RESOURCE');
            expect(actions).toContain('CREATE_NOTE_ABOUT_RESOURCE');
            expect(actions).toContain('CONNECT_RESOURCES_WITH_NOTE');
            expect(actions).toContain('PUBLISH_RESOURCE');

            // expect tags to be empty
            // expect categories to be empty
            // expect notes to be empty

            assertResourceHasContributionFor(dummyContributor, view);
        });
    });
});
