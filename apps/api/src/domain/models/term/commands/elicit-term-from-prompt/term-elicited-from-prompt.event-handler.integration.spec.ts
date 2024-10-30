import {
    AggregateType,
    IDetailQueryResult,
    IMultilingualTextItem,
    ITermViewModel,
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
import { ArangoDatabaseForCollection } from '../../../../../persistence/database/arango-database-for-collection';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ArangoAudioItemQueryRepository } from '../../../audio-visual/audio-item/repositories/arango-audio-item-query-repository';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { PromptTermCreated } from '../create-prompt-term';
import { TermElicitedFromPromptEventHandler } from './term-elicited-from-prompt.event-handler';
import { TermElicitedFromPrompt } from './term.elicited.from.prompt';

const termId = buildDummyUuid(1);

const promptTermCreated = new TestEventStream().andThen<PromptTermCreated>({
    type: 'PROMPT_TERM_CREATED',
});

const termElicitedFromPrompt = promptTermCreated.andThen<TermElicitedFromPrompt>({
    type: 'TERM_ELICITED_FROM_PROMPT',
});

const [creationEvent, elicitationEvent] = termElicitedFromPrompt.as({
    type: AggregateType.term,
    id: termId,
}) as [PromptTermCreated, TermElicitedFromPrompt];

describe(`TermElicitedFromPromptEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let arangoDatabaseForCollection: ArangoDatabaseForCollection<
        IDetailQueryResult<ITermViewModel>
    >;

    let app: INestApplication;

    let termElicitedFromPromptEventHandler: TermElicitedFromPromptEventHandler;

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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ArangoAudioItemQueryRepository(connectionProvider),
            new ConsoleCoscradCliLogger()
        );

        termElicitedFromPromptEventHandler = new TermElicitedFromPromptEventHandler(
            testQueryRepository
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        arangoDatabaseForCollection.clear();

        const existingView = TermViewModel.fromPromptTermCreated(
            creationEvent as PromptTermCreated
        );

        /**
         * We attempted to use "handle" on a creation event for the test
         * setup, but it failed due to an apparent race condition.
         *
         * We should investigate this further.
         */
        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing term`, () => {
        it(`should update the corresponding view appropriately in the database`, async () => {
            await termElicitedFromPromptEventHandler.handle(elicitationEvent);

            const searchResult = await testQueryRepository.fetchById(termId);

            expect(searchResult).not.toBe(NotFound);

            const updatedView = searchResult as TermViewModel;

            const updatedName = new MultilingualText(updatedView.name);

            const translationItem = updatedName.getTranslation(
                elicitationEvent.payload.languageCode
            );

            expect(translationItem).not.toBe(NotFound);

            const { text, languageCode } = translationItem as IMultilingualTextItem;

            expect(text).toBe(elicitationEvent.payload.text);

            expect(languageCode).toBe(elicitationEvent.payload.languageCode);
        });
    });

    describe(`when the term does not exist`, () => {
        it.todo(`should fail gracefully`);
    });
});
