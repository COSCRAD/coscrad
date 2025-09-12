import { AggregateType, LanguageCode, ResourceType } from '@coscrad/api-interfaces';
import { TestingModule } from '@nestjs/testing';
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'fs';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { ARANGO_BULK_JOB_COLLECTION_NAME } from '../app/controllers/command/bulk-imports/arango-bulk-job-repository';
import { CoscradBulkImportJobCreateDto } from '../app/controllers/command/bulk-imports/bulk-import-job.create-dto.entity';
import {
    BULK_JOB_REPOSITORY_INJECTION_TOKEN,
    IBulkJobRepository,
} from '../app/controllers/command/bulk-imports/bulk-job-repository.interface';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { AudioItemCreated } from '../domain/models/audio-visual/audio-item/commands/create-audio-item/audio-item-created.event';
import { AudioItem } from '../domain/models/audio-visual/audio-item/entities/audio-item.entity';
import { AddLyricsForSong, CreateSong } from '../domain/models/song/commands';
import { IRepositoryProvider } from '../domain/repositories/interfaces/repository-provider.interface';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { TestEventStream } from '../test-data/events';
import { buildTestInstance } from '../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'manage-bulk-jobs';

const testDataDir = `apps/api/src/coscrad-cli`;

const dataFile = `${testDataDir}/manage-bulk-jobs.cli-command.SAMPLE.json`;

const withMetaAndUuid = (fsa, uuid) => {
    fsa.payload.aggregateCompositeIdentifier.id = uuid;

    return {
        ...fsa,
        meta: {
            contributorIds: [],
            userId: 'COSCRAD_ADMIN',
        },
    };
};

const testAudioItemId = buildDummyUuid(193);

const testAudioItem = AudioItem.fromEventHistory(
    new TestEventStream()
        .andThen<AudioItemCreated>({
            type: 'AUDIO_ITEM_CREATED',
        })
        .as({
            type: AggregateType.audioItem,
            id: testAudioItemId,
        }),
    testAudioItemId
) as AudioItem; // event sourcing will not fail here

describe(cliCommandName, () => {
    let bulkJobRepo: IBulkJobRepository;

    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    const mockLogger = buildMockLogger({ isEnabled: true });

    beforeEach(async () => {
        const testAppModule = await createTestModule(
            {
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            },
            {
                shouldMockIdGenerator: true,
            }
        );

        await testAppModule.init();

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = testAppModule.get(TestRepositoryProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider('ID_MANAGER')
            .useValue(testAppModule.get('ID_MANAGER'))
            .overrideProvider(DynamicDataTypeModule)
            .useValue(DynamicDataTypeModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            // TODO remove use of `createTestModule` here. It really causes problems.
            .overrideProvider(BULK_JOB_REPOSITORY_INJECTION_TOKEN)
            .useValue(testAppModule.get(BULK_JOB_REPOSITORY_INJECTION_TOKEN))
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();

        await testAppModule.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

        await testRepositoryProvider.testTeardown();

        await databaseProvider.getDatabaseForCollection(ARANGO_BULK_JOB_COLLECTION_NAME).clear();

        bulkJobRepo = testAppModule.get(BULK_JOB_REPOSITORY_INJECTION_TOKEN);

        await testAppModule
            .get<IRepositoryProvider>(REPOSITORY_PROVIDER_TOKEN)
            .forResource(ResourceType.audioItem)
            .create(testAudioItem);

        jest.clearAllMocks();

        if (!existsSync(testDataDir)) {
            mkdirSync(testDataDir);
        }

        if (existsSync(dataFile)) {
            rmSync(dataFile);
        }
    });

    afterEach(async () => {
        if (existsSync(dataFile)) {
            rmSync(dataFile);
        }
    });

    describe(`when the request is well-formed`, () => {
        describe(`when the bulk job is invalid`, () => {
            const testJobName = 'invalid bulk job (should have errors)';

            const slugId = 's123';

            const validCreateCommand = {
                type: 'CREATE_SONG',
                payload: buildTestInstance(CreateSong, {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.song,
                        id: `GENERATE_THIS_ID:${slugId}`,
                    },
                    audioItemId: testAudioItemId,
                    rawData: {
                        slug: slugId,
                    },
                }),
            };

            const invalidUpdateCommand = {
                type: 'ADD_LYRICS_FOR_SONG',
                payload: buildTestInstance(AddLyricsForSong, {
                    aggregateCompositeIdentifier: {
                        type: AggregateType.song,
                        id: `APPEND_THIS_ID:${slugId}`,
                    },
                    languageCode: 'foobarbaz (bad language code)' as LanguageCode,
                }),
            };

            const bulkJobWithErrors = buildTestInstance(CoscradBulkImportJobCreateDto, {
                name: testJobName,
                stream: [validCreateCommand, invalidUpdateCommand],
            });

            beforeEach(async () => {
                writeFileSync(dataFile, JSON.stringify(bulkJobWithErrors, null, 4));
            });

            it(`should report the errors`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--data-file=${dataFile}`,
                ]);

                const bulkJobs = await bulkJobRepo.fetchMany();

                const { name: foundName, results } = bulkJobs[0];

                expect(foundName).toBe(testJobName);

                const { fsa: foundFirstFsa, result: firstResult } = results[0];

                // TODO Why doesn't the MockIdGenerator use the same prefix as `buildDummyUuid` so we can compare to `buildDummyUuid(1)` ?
                const dummyIdGeneratedForSong = '41fb2d7f-c483-4e09-a1f0-e9909a6b0001';

                expect(foundFirstFsa).toEqual(
                    withMetaAndUuid(validCreateCommand, dummyIdGeneratedForSong)
                );

                expect(firstResult).toBe('ACK');

                const { fsa: foundSecondFsa, result: secondResult } = results[1];

                expect(foundSecondFsa).toEqual(
                    withMetaAndUuid(invalidUpdateCommand, dummyIdGeneratedForSong)
                );

                expect(secondResult).toContain(invalidUpdateCommand.type);

                expect(secondResult).toContain('is enum LanguageCode');
            });
        });
    });
});
