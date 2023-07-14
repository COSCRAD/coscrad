import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { ID_MANAGER_TOKEN } from '../domain/interfaces/id-manager.interface';
import { CreateSong } from '../domain/models/song/commands/create-song.command';
import { AggregateType } from '../domain/types/AggregateType';
import { MockIdManagementService } from '../lib/id-generation/mock-id-management.service';
import { NotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoIdRepository } from '../persistence/repositories/arango-id-repository';
import { CoscradCliModule } from './coscrad-cli.module';
import { COSCRAD_LOGGER_TOKEN } from './logging';
import { buildMockLogger } from './logging/__tests__';

const cliCommandName = `seed-test-data-with-command`;

const assertErrorMessageLogged = (
    textToInclude: string,
    actualCalls: string[][],
    callIndex: [number, number] = [1, 0]
) => {
    /**
     * We do things this way so that the failing error message will show up in
     * the console whenever the test fails. This is far more useful than seeing
     * > > > expect(isMesageContained).toBe(true)
     *
     * > > > expected true, received false
     */
    const unacceptableFailureMessages = [actualCalls[callIndex[0]][callIndex[1]]].filter(
        (message) => !message.includes(textToInclude)
    );

    expect(unacceptableFailureMessages).toEqual([]);
};

describe(`CLI Command: ${cliCommandName}`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let mockIdManager;

    const mockLogger = buildMockLogger({ isEnabled: true });

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        const idManager = new MockIdManagementService(new ArangoIdRepository(databaseProvider));

        mockIdManager = {
            generate: jest.fn().mockImplementation(async () => idManager.generate()),
            status: (id: string) => idManager.status(id),
            use: ({ id, type }: { id: string; type: AggregateType | 'event' }) =>
                idManager.use({
                    id,
                    type,
                }),
        };

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(ID_MANAGER_TOKEN)
            .useValue(mockIdManager)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        await jest.clearAllMocks();
    });

    const createCommandType = 'CREATE_SONG';

    const dummyAudioUrl = 'https://www.foobar.baz/lalala.mp3';

    const payloadOverrides: Partial<CreateSong> = {
        audioURL: dummyAudioUrl,
    };

    describe(`when the command is valid`, () => {
        describe(`when executing a create command (requires ID generation)`, () => {
            const serializedPayloadOverrids = JSON.stringify(payloadOverrides);

            it(`should succeed`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${createCommandType}`,
                    `--payload-overrides=${serializedPayloadOverrids}`,
                ]);

                const newId = await mockIdManager.generate.mock.results[0].value;

                const searchResult = await testRepositoryProvider
                    .forResource(AggregateType.song)
                    .fetchById(newId);

                expect(searchResult).not.toBe(NotFound);
            });
        });

        describe(`when executing an update command`, () => {
            it.todo(`should have a test`);
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the payload overrides are invalid`, () => {
            describe(`when there is a superfluous property`, () => {
                it(`should fail with the expected error message`, async () => {
                    const overridesWithExtraProperty = {
                        ...payloadOverrides,
                        bogus: 'foobarbaz',
                    };

                    const serializedOverrides = JSON.stringify(overridesWithExtraProperty);

                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--type=${createCommandType}`,
                        `--payload-overrides=${serializedOverrides}`,
                    ]);

                    assertErrorMessageLogged('not a known', mockLogger.log.mock.calls, [1, 0]);
                });
            });
        });

        describe(`when the command has a valid type but fails due to invalid state`, () => {
            it.todo(`should have a test`);
        });

        describe(`when the overrides are ill-formed serialized JSON`, () => {
            it(`should fail with the expected errors`, async () => {
                const unparseableOverrides = `{"foo": 5`; // missing closing `}`

                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${createCommandType}`,
                    `--payload-overrides=${unparseableOverrides}`,
                ]);

                assertErrorMessageLogged(`Failed to parse`, mockLogger.log.mock.calls, [0, 0]);
            });
        });
    });
});
