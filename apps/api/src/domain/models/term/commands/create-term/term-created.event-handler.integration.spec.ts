import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { CommandInfoService } from '../../../../../app/controllers/command/services/command-info-service';
import { TermCommandsModule } from '../../../../../app/domain-modules/term.commands.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { IRepositoryProvider } from '../../../../../domain/repositories/interfaces/repository-provider.interface';
import { NotFound } from '../../../../../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../../../../../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoCollectionId } from '../../../../../persistence/database/collection-references/ArangoCollectionId';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { TermCreated } from './term-created.event';
import { TermCreatedEventHandler } from './term-created.event-handler';

const textForTerm = 'boo yah';

const languageCode = LanguageCode.Chilcotin;

const termId = buildDummyUuid(1);

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const termCreated = new TestEventStream()
    .andThen<TermCreated>({
        type: 'TERM_CREATED',
        payload: {
            text: textForTerm,
            languageCode,
        },
        meta: {
            contributorIds: [dummyContributor.id],
        },
    })
    .as({
        id: termId,
        type: AggregateType.digitalText,
    })[0]; // There is only one event in this stream, which is the target event

describe(`TermCreatedEventHandler`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, TermCreatedEventHandler],
            imports: [PersistenceModule.forRootAsync(), CommandModule, TermCommandsModule],
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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    describe(`when handling a term created event`, () => {
        beforeEach(async () => {
            await databaseProvider.clearViews();

            await databaseProvider
                .getDatabaseForCollection(ArangoCollectionId.contributors)
                .clear();

            await app
                .get<IRepositoryProvider>(REPOSITORY_PROVIDER_TOKEN)
                .getContributorRepository()
                .create(dummyContributor);
        });

        it(`should create the expected view in the database`, async () => {
            const handler = app.get(TermCreatedEventHandler);

            // @ts-expect-error Fix this issue
            await handler.handle(termCreated);

            const searchResult = await testQueryRepository.fetchById(termId);

            expect(searchResult).not.toBe(NotFound);

            const foundTerm = searchResult as TermViewModel;

            const { name: nameDto, contributions, actions } = foundTerm;

            const name = new MultilingualText(nameDto);

            const originalTextItem = name.getOriginalTextItem();

            expect(originalTextItem.text).toBe(textForTerm);

            expect(originalTextItem.languageCode).toBe(languageCode);

            expect(actions).toContain('TRANSLATE_TERM');
            expect(actions).not.toContain('ELICIT_TERM_FROM_PROMPT');

            expect(actions).toContain('TAG_RESOURCE');
            expect(actions).toContain('CREATE_NOTE_ABOUT_RESOURCE');
            expect(actions).toContain('CONNECT_RESOURCES_WITH_NOTE');
            expect(actions).toContain('PUBLISH_RESOURCE');
            expect(actions).toContain('ADD_AUDIO_FOR_TERM');

            // expect tags to be empty
            // expect categories to be empty
            // expect notes to be empty

            expect(
                contributions.some(
                    // this should actually be the name and ID
                    (c) => c.id === dummyContributor.id
                )
            ).toBe(true);

            // TODO check the contributor's full name as well
        });
    });
});
