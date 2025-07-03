import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandModule } from '@coscrad/commands';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, readFileSync, unlinkSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import buildMockConfigServiceSpec from '../app/config/__tests__/utilities/buildMockConfigService';
import buildConfigFilePath from '../app/config/buildConfigFilePath';
import { Environment } from '../app/config/constants/environment';
import { EdgeConnectionModule } from '../app/domain-modules/edge-connection.module';
import { TermModule } from '../app/domain-modules/term.module';
import { EventModule } from '../domain/common';
import { buildMultilingualTextWithSingleItem } from '../domain/common/build-multilingual-text-with-single-item';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { AudioVisualModule } from '../domain/models/audio-visual/application/audio-visual.module';
import { AudioItemCreated } from '../domain/models/audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { EventSourcedAudioItemViewModel } from '../domain/models/audio-visual/audio-item/queries';
import {
    AUDIO_QUERY_REPOSITORY_TOKEN,
    IAudioItemQueryRepository,
} from '../domain/models/audio-visual/audio-item/queries/audio-item-query-repository.interface';
import { ResourcePublished } from '../domain/models/shared/common-commands/publish-resource/resource-published.event';
import { ITermQueryRepository, TERM_QUERY_REPOSITORY_TOKEN } from '../domain/models/term/queries';
import { AudioDiscoveryResult } from '../domain/services/query-services/term-query.service';
import { AggregateId } from '../domain/types/AggregateId';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import { PersistenceModule } from '../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { TermViewModel } from '../queries/buildViewModelForResource/viewModels/term.view-model';
import { buildTestInstance } from '../test-data/utilities';
import { DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const audioSequenceNumbers = [1, 2, 3, 4];

const targetAudioFilePrefixes = audioSequenceNumbers.map(
    (sequenceNumber) => `filename-${sequenceNumber}`
);

const buildAudioFilenameFromPrefix = (prefix: string) => `audio-${prefix}_JD`;

const audioItems = audioSequenceNumbers.map((sequenceNumber, index) =>
    buildTestInstance(EventSourcedAudioItemViewModel, {
        id: buildDummyUuid(sequenceNumber + 200),
        mediaItemId: buildDummyUuid(sequenceNumber + 100),
        name: buildMultilingualTextWithSingleItem(
            buildAudioFilenameFromPrefix(targetAudioFilePrefixes[index])
        ),
    })
);

const cliCommandName = 'discover-audio-for-terms';

const mockLogger = buildMockLogger({ isEnabled: true });

const outputDir = `__cli-command-test-files__`;

const outputFilepath = `${outputDir}/discover-audio-items.cli-command.valid-case.data.json`;

const termWithAudio = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(1),
    // this should not collide with a target audio item's media item ID
    mediaItemId: buildDummyUuid(190),
});

const termWithOneAudioCandidate = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(2),
    mediaItemId: undefined,
    // this ensures we support "string contains" (partial match for infixes of file names)
    possibleAudioFilenames: [targetAudioFilePrefixes[0]],
});

const termWithMultipleAudioCandidatesAndOneMatch = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(3),
    mediaItemId: undefined,
    possibleAudioFilenames: [
        buildAudioFilenameFromPrefix(targetAudioFilePrefixes[1]),
        `another-possible-audio`,
    ],
});

const termWithMultipleAudioCandidatesAndMultipleMatches = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(4),
    mediaItemId: undefined,
    possibleAudioFilenames: [
        buildAudioFilenameFromPrefix(targetAudioFilePrefixes[2]),
        buildAudioFilenameFromPrefix(targetAudioFilePrefixes[3]),
    ],
});

const termWithOneAudioCandidateAndNoMatches = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(5),
    mediaItemId: undefined,
    possibleAudioFilenames: [buildAudioFilenameFromPrefix('no-audio-with-this-name-1')],
});

const termWithSeveralAudioCandidatesAndNoMatches = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(6),
    mediaItemId: undefined,
    possibleAudioFilenames: [4, 5, 6].map((n) => `no-audio-with-this-name-${n}`),
});

const termWithAudioAndPossibleAudioFilenames = buildTestInstance(TermViewModel, {
    id: buildDummyUuid(7),
    // this should not collide with a target audio item's media item ID
    mediaItemId: buildDummyUuid(191),
    possibleAudioFilenames: [
        'already-been-used',
        'unused-audio-candidate',
        'another-unused-audio-candidate',
    ],
});

const numberOfTermsWithASingleAudioMatch = 2;

// 2 unambiguous results, 1 term with multiple audio candidates
const allTerms = [
    // 0 results
    termWithAudio,
    // 0 results
    termWithAudioAndPossibleAudioFilenames,
    // multiple results
    termWithMultipleAudioCandidatesAndMultipleMatches,
    // 1 result
    termWithMultipleAudioCandidatesAndOneMatch,
    // 1 result
    termWithOneAudioCandidate,
    // 0 results
    termWithOneAudioCandidateAndNoMatches,
    // 0 results
    termWithSeveralAudioCandidatesAndNoMatches,
];

describe(`CLI Command: **${cliCommandName}**`, () => {
    let commandInstance: TestingModule;

    let databaseProvider: ArangoDatabaseProvider;

    let testAppModule: TestingModule;

    let audioItemQueryRepository: IAudioItemQueryRepository;

    let termQueryRepository: ITermQueryRepository;

    beforeEach(async () => {
        testAppModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    isGlobal: true,
                    envFilePath: buildConfigFilePath(process.env.NODE_ENV),
                    cache: false,
                }),
                CommandModule,
                EventModule,
                DynamicDataTypeModule,
                PersistenceModule.forRootAsync(),
                TermModule,
                AudioVisualModule,
                EdgeConnectionModule,
            ],
            providers: [AudioItem, ResourcePublished, AudioItemCreated].map((Ctor) => ({
                provide: Ctor,
                useValue: Ctor,
            })),
        })
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigServiceSpec(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .compile();

        await testAppModule.init();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        audioItemQueryRepository = testAppModule.get(AUDIO_QUERY_REPOSITORY_TOKEN);

        termQueryRepository = testAppModule.get(TERM_QUERY_REPOSITORY_TOKEN);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigServiceSpec(
                    {
                        ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                    },
                    buildConfigFilePath(Environment.test)
                )
            )
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();
    });

    beforeEach(async () => {
        jest.resetAllMocks();

        if (!existsSync(outputDir)) {
            mkdirSync(outputDir);
        }

        if (existsSync(outputFilepath)) {
            // remove the existing output file
            unlinkSync(outputFilepath);
        }

        await databaseProvider.clearViews();
    });

    const languageCodeForAudio = LanguageCode.Chilcotin;

    describe(`when there are terms with valid audio candidates`, () => {
        beforeEach(async () => {
            await audioItemQueryRepository.createMany(audioItems);
        });

        describe(`when publication is requested`, () => {
            beforeEach(async () => {
                await termQueryRepository.createMany(allTerms);
            });

            it(`should return the expected result`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--filepath=${outputFilepath}`,
                    `--languageCode=${languageCodeForAudio}`,
                    `--publish`,
                ]);

                // TODO assert file contents helper?
                const fileExists = existsSync(outputFilepath);

                expect(fileExists).toBe(true);

                const raw = readFileSync(outputFilepath);

                const { bulkCommandStream, byTerm } = JSON.parse(
                    raw.toString()
                ) as AudioDiscoveryResult;

                // one option has multiple audio candidates, 2 have exactly 1, rest 0, with publication for each
                expect(bulkCommandStream).toHaveLength(numberOfTermsWithASingleAudioMatch * 2);

                const assertNoEntryForTerm = (termId: AggregateId) => {
                    const searchResult = byTerm.find(({ term }) => term.id === termId);

                    expect(searchResult).toBe(undefined);
                };

                /**
                 * Discovery should not find audio for any of the following terms.
                 */
                assertNoEntryForTerm(termWithAudio.id);

                assertNoEntryForTerm(termWithAudioAndPossibleAudioFilenames.id);

                assertNoEntryForTerm(termWithOneAudioCandidateAndNoMatches.id);

                assertNoEntryForTerm(termWithSeveralAudioCandidatesAndNoMatches.id);

                const { importOptions: importOptionsForTermWithOneAudioCandidate } = byTerm.find(
                    ({ term }) => term.id === termWithOneAudioCandidate.id
                );

                expect(importOptionsForTermWithOneAudioCandidate).toHaveLength(1);

                const {
                    importOptions:
                        importOptionsForTermWithMultipleAudioCandidatesAndMultipleMatches,
                } = byTerm.find(
                    ({ term }) => term.id === termWithMultipleAudioCandidatesAndMultipleMatches.id
                );

                expect(
                    importOptionsForTermWithMultipleAudioCandidatesAndMultipleMatches
                ).toHaveLength(2);

                const {
                    importOptions: importOptionsForTermWithMultipleAudioCandidatesAndOneMatch,
                } = byTerm.find(
                    ({ term }) => term.id === termWithMultipleAudioCandidatesAndOneMatch.id
                );

                expect(importOptionsForTermWithMultipleAudioCandidatesAndOneMatch).toHaveLength(1);

                const { actions } = importOptionsForTermWithMultipleAudioCandidatesAndOneMatch[0];

                // add audio, publish term
                expect(actions).toHaveLength(2);

                expect(actions[0].type).toBe('ADD_AUDIO_FOR_TERM');

                expect(actions[1].type).toBe('PUBLISH_RESOURCE');
            });
        });

        describe(`when publication is not requested`, () => {
            beforeEach(async () => {
                await termQueryRepository.create(termWithMultipleAudioCandidatesAndOneMatch);
            });

            it(`should not publish the term`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--filepath=${outputFilepath}`,
                    `--languageCode=${languageCodeForAudio}`,
                    // `--publish`,
                ]);

                // TODO assert file contents helper?
                const fileExists = existsSync(outputFilepath);

                expect(fileExists).toBe(true);

                const raw = readFileSync(outputFilepath);

                const { bulkCommandStream, byTerm } = JSON.parse(
                    raw.toString()
                ) as AudioDiscoveryResult;

                /**
                 * Since the only term with a result has exactly 1 candidate,
                 * all commands are flattened into `bulkCommandStream`.
                 */
                expect(bulkCommandStream).toHaveLength(1);

                expect(
                    byTerm.find(
                        ({ term }) => term.id == termWithMultipleAudioCandidatesAndOneMatch.id
                    ).importOptions
                ).toHaveLength(1);
            });
        });
    });

    describe(`when a required parameter is omitted`, () => {
        it.todo(`should have a test`);
    });
});
