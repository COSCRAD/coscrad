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
import { WebOfKnowledgeModule } from '../../../../../app/domain-modules/web-of-knowledge/web-of-knowledge.module';
import { ConsoleCoscradCliLogger } from '../../../../../coscrad-cli/logging';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { MultilingualText } from '../../../../../domain/common/entities/multilingual-text';
import { IRepositoryProvider } from '../../../../../domain/repositories/interfaces/repository-provider.interface';
import { CoscradNLPModule } from '../../../../../lib/nlp';
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
import { Attributor } from '../../../shared/common-event-handlers/attributor.event-handler';
import { ITermQueryRepository } from '../../queries';
import { ArangoTermQueryRepository } from '../../repositories/arango-term-query-repository';
import { TermCreated } from './term-created.event';
import { TermCreatedEventHandler } from './term-created.event-handler';

const lettersInTerm = [
    ['ts’', 'e', 'd'],
    ['n', 'e', 'n', 'ch', 'a', 'gh'],
];

const textForTerm = lettersInTerm.map((lettersInWord) => lettersInWord.join('')).join(' ');

const languageCode = LanguageCode.Chilcotin;

const termId = buildDummyUuid(1);

const dummyContributor = getValidAggregateInstanceForTest(AggregateType.contributor);

const possibleAudioFilenames = ['myaudio'];

const standaloneAudioFilename = '12345';

const termCreated = new TestEventStream()
    .andThen<TermCreated>({
        type: 'TERM_CREATED',
        payload: {
            text: textForTerm,
            languageCode,
            rawData: {
                possibleAudioFilenames,
                audioFilename: standaloneAudioFilename,
            },
        },
        meta: {
            contributorIds: [dummyContributor.id],
        },
    })
    .as({
        id: termId,
        type: AggregateType.term,
    })[0]; // There is only one event in this stream, which is the target event

describe(`TermCreatedEventHandler`, () => {
    let testQueryRepository: ITermQueryRepository;

    let databaseProvider: ArangoDatabaseProvider;

    let app: INestApplication;

    beforeAll(async () => {
        const moduleRef = await Test.createTestingModule({
            providers: [CommandInfoService, TermCreatedEventHandler],
            imports: [
                PersistenceModule.forRootAsync(),
                CoscradNLPModule,
                CommandModule,
                TermCommandsModule,
                /**
                 * This is necessary for attributions to be picked up
                 * under our current approach.
                 *
                 * TODO Should we have a separate test for attribution
                 * that uses a scenario test approach?
                 */
                WebOfKnowledgeModule,
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

            /**
             * TODO Move this out to a scenario test or do this with Cypress
             *
             * We don't want to test the attribution explicitly in event handler tests.
             * We do this as a one-off in the present test so we have some test coverage for now.
             * Eventually, we will update our approach so that each update is wrapped in a transaction
             * that also writes the attribution. For now, we perform attribution in a separate,
             * non-atomic handler, so that if this handler fails, attribution
             * retries don't lead to duplicate writes. Alternatively, we could
             * make handlers idempotent, but this complicates the logic for
             * queries and makes them harder to understand.
             */
            await app.get(Attributor).handle(termCreated);

            const searchResult = await testQueryRepository.fetchById(termId);

            expect(searchResult).not.toBe(NotFound);

            const foundTerm = searchResult as TermViewModel;

            const {
                name: nameDto,
                contributions,
                actions,
                tokens,
                possibleAudioFilenames: foundAudioFilenameCandidates,
            } = foundTerm;

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

            const wordsThatAreMissingTokens = lettersInTerm.filter(
                (letters, index) => tokens[index].text !== letters.join('')
            );

            expect(wordsThatAreMissingTokens).toEqual([]);

            expect(tokens.map(({ characters }) => characters.map(({ text }) => text))).toEqual(
                lettersInTerm
            );

            // expect tags to be empty
            // expect categories to be empty
            // expect notes to be empty

            expect(
                contributions[0].contributorIds.some(
                    // this should actually be the name and ID
                    (cid) => cid === dummyContributor.id
                )
            ).toBe(true);

            // the array plus the standalone prop
            expect(foundAudioFilenameCandidates).toHaveLength(possibleAudioFilenames.length + 1);

            expect(foundAudioFilenameCandidates[0]).toBe(possibleAudioFilenames[0]);

            expect(foundAudioFilenameCandidates[1]).toBe(standaloneAudioFilename);

            // TODO check the contributor's full name as well
        });
    });
});
