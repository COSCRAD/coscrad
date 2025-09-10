import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { Ack } from '@coscrad/commands';
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
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import { AddLyricsForSong, CreateSong } from '../domain/models/song/commands';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../validation';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = 'manage-bulk-jobs';

const testDataDir = `apps/api/src/coscrad-cli`;

const dataFile = `${testDataDir}/manage-bulk-jobs.cli-command.SAMPLE.json`;

const withMeta = (fsa) => ({
    ...fsa,
    meta: {
        contributorIds: [],
        userId: 'COSCRAD_ADMIN',
    },
});

describe(cliCommandName, () => {
    let _bulkJobRepo: IBulkJobRepository;

    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let _idGenerator: IIdManager;

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

        _idGenerator = testAppModule.get(ID_MANAGER_TOKEN);

        await testRepositoryProvider.testTeardown();

        await databaseProvider.getDatabaseForCollection(ARANGO_BULK_JOB_COLLECTION_NAME).clear();

        _bulkJobRepo = testAppModule.get(BULK_JOB_REPOSITORY_INJECTION_TOKEN);

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

            const bulkJobs = await _bulkJobRepo.fetchMany();

            const { name: foundName, results } = bulkJobs[0];

            expect(foundName).toBe(testJobName);

            const { fsa: foundFirstFsa, result: firstResult } = results[0];

            expect(foundFirstFsa).toEqual(withMeta(validCreateCommand));

            expect(firstResult).toBe(Ack);

            const { fsa: foundSecondFsa, result: secondResult } = results[1];

            expect(foundSecondFsa).toEqual(withMeta(invalidUpdateCommand));

            expect(secondResult).toContain('peace on you, bro!');
        });
    });
});
