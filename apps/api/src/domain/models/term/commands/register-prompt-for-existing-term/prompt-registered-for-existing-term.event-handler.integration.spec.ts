import {
    AggregateType,
    IMultilingualTextItem,
    LanguageCode,
    MultilingualTextItemRole,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../domain/common/entities/multilingual-text';
import { CoscradNLPModule } from '../../../../../lib/nlp';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { TestEventStream } from '../../../../../test-data/events';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ResourcePublished } from '../../../shared/common-commands/publish-resource/resource-published.event';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories';
import { TermCreated } from '../create-term';
import { PromptRegisteredForExistingTermEventHandler } from '../register-prompt-for-existing-term/prompt-registered-for-existing-term.event-handler';
import { PromptRegisteredForExistingTerm } from './prompt-registered-for-existing-term.event';

const termId = buildDummyUuid(34);

const originalText = 'existing term text';

const originalLanguageCode = LanguageCode.Chilcotin;

const promptText = 'how do you say term';

const promptLanguageCode = LanguageCode.English;

const termCreated = new TestEventStream().andThen<TermCreated>({
    type: 'TERM_CREATED',
    payload: {
        text: originalText,
        languageCode: originalLanguageCode,
    },
});

const promptRegistered = termCreated
    .andThen<ResourcePublished>({ type: 'RESOURCE_PUBLISHED' })
    .andThen<PromptRegisteredForExistingTerm>({
        type: 'PROMPT_REGISTERED_FOR_EXISTING_TERM',
        payload: {
            text: promptText,
            languageCode: promptLanguageCode,
            aggregateCompositeIdentifier: { id: termId },
        },
    });

const [creationEvent, _resourcePublished, promptedEvent] = promptRegistered.as({
    type: AggregateType.term,
    id: termId,
}) as [TermCreated, ResourcePublished, PromptRegisteredForExistingTerm];

describe(`PromptRegisteredForExistingTermEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let promptRegisteredForExistingTermEventHandler: PromptRegisteredForExistingTermEventHandler;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            imports: [PersistenceModule.forRootAsync(), CoscradNLPModule],
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

        testQueryRepository = new ArangoTermQueryRepository(
            connectionProvider,
            new ConsoleCoscradCliLogger()
        );

        promptRegisteredForExistingTermEventHandler =
            new PromptRegisteredForExistingTermEventHandler(testQueryRepository);
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

        const existingView = TermViewModel.fromTermCreated(creationEvent as TermCreated);

        existingView.isPublished = true;

        await testQueryRepository.create(existingView);
    });

    describe(`when there is an existing term`, () => {
        it(`should update the corresponding view appropriately in the database`, async () => {
            await promptRegisteredForExistingTermEventHandler.handle(promptedEvent);

            const updatedView = (await testQueryRepository.fetchById(termId)) as TermViewModel;

            expect(updatedView.name.getOriginalTextItem()).toEqual({
                text: promptText,
                languageCode: promptLanguageCode,
                role: MultilingualTextItemRole.original,
            });

            // TODO do we want isPromptTerm on the view model?
            expect(
                updatedView.name.getTranslation(originalLanguageCode) as MultilingualTextItem
            ).toEqual({
                text: originalText,
                languageCode: originalLanguageCode,
                role: MultilingualTextItemRole.elicitedFromPrompt,
            });

            const updatedName = new MultilingualText(updatedView.name);

            const translationItem = updatedName.getTranslation(promptedEvent.payload.languageCode);

            expect(translationItem).not.toBe(NotFound);

            const { text, languageCode } = translationItem as IMultilingualTextItem;

            expect(text).toBe(promptedEvent.payload.text);

            expect(languageCode).toBe(promptedEvent.payload.languageCode);
        });
    });
});
