import {
    AggregateType,
    CoscradUserRole,
    IMultilingualTextItem,
    LanguageCode,
} from '@coscrad/api-interfaces';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildConfigFilePath from '../../../../../app/config/buildConfigFilePath';
import { Environment } from '../../../../../app/config/constants/environment';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { InternalError } from '../../../../../lib/errors/InternalError';
import { CoscradNLPModule } from '../../../../../lib/nlp';
import { ChilcotinTokenizer } from '../../../../../lib/nlp/tokenization';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoConnectionProvider } from '../../../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../../../../../queries/buildViewModelForResource/viewModels/term.view-model';
import { formatLanguageCode } from '../../../../../queries/presentation/formatLanguageCode';
import { TestEventStream } from '../../../../../test-data/events';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { CoscradUserWithGroups } from '../../../user-management/user/entities/user/coscrad-user-with-groups';
import { CoscradUser } from '../../../user-management/user/entities/user/coscrad-user.entity';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { PromptTermCreated } from '../create-prompt-term';
import { TermElicitedFromPromptEventHandler } from './term-elicited-from-prompt.event-handler';
import { TermElicitedFromPrompt } from './term-elicited.from.prompt.event';

const termId = buildDummyUuid(1);

const sCap = String.fromCodePoint(349);

const lettersInElicitedTerm = [
    ['lh', 'a'],
    [sCap, 'i', 'n', 'j', 'e', 'n'],
];

const elicitedTermText = `Lha ŝinjen`;

const promptTermCreated = new TestEventStream().andThen<PromptTermCreated>({
    type: 'PROMPT_TERM_CREATED',
});

const termElicitedFromPrompt = promptTermCreated.andThen<TermElicitedFromPrompt>({
    type: 'TERM_ELICITED_FROM_PROMPT',
    payload: {
        text: elicitedTermText,
        // This must line up with the expected tokenization result
        languageCode: LanguageCode.Chilcotin,
    },
});

const [creationEvent, elicitationEvent] = termElicitedFromPrompt.as({
    type: AggregateType.term,
    id: termId,
}) as [PromptTermCreated, TermElicitedFromPrompt];

const testAdminUser = new CoscradUserWithGroups(
    buildTestInstance(CoscradUser, {
        roles: [CoscradUserRole.superAdmin],
    }),
    []
);

describe(`TermElicitedFromPromptEventHandler.handle`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    let termElicitedFromPromptEventHandler: TermElicitedFromPromptEventHandler;

    const testTokenizerProvider = {
        has(languageCode: LanguageCode) {
            return languageCode === LanguageCode.Chilcotin;
        },
        forLanguage(languageCode: LanguageCode) {
            if (languageCode === LanguageCode.Chilcotin) return new ChilcotinTokenizer();

            throw new InternalError(
                `Tokenization is not supported for language: ${formatLanguageCode(
                    languageCode
                )}. Did you forget to check tokenizerProvider.has(${languageCode})?`
            );
        },
    };

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

        termElicitedFromPromptEventHandler = new TermElicitedFromPromptEventHandler(
            testQueryRepository,
            testTokenizerProvider
        );
    });

    afterAll(async () => {
        databaseProvider.close();
    });

    beforeEach(async () => {
        await databaseProvider.clearViews();

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

            const searchResult = await testQueryRepository.fetchById(termId, testAdminUser);

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

            expect(updatedView.actions).not.toContain('ELICIT_TERM_FROM_PROMPT');

            const { tokens } = updatedView;

            const wordsThatAreMissingTokens = lettersInElicitedTerm.filter((letters, index) => {
                tokens[index].text.toLowerCase() !== letters.join('').toLowerCase();
            });

            expect(wordsThatAreMissingTokens).toEqual([]);

            const foundLetters = tokens.map(({ characters }) => characters.map(({ text }) => text));

            expect(foundLetters).toEqual(lettersInElicitedTerm);
        });
    });

    describe(`when the term does not exist`, () => {
        it.todo(`should fail gracefully`);
    });
});
