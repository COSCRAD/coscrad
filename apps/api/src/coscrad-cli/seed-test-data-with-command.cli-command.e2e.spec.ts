import { LanguageCode } from '@coscrad/api-interfaces';
import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import getValidAggregateInstanceForTest from '../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { ID_MANAGER_TOKEN, IIdManager } from '../domain/interfaces/id-manager.interface';
import buildDummyUuid from '../domain/models/__tests__/utilities/buildDummyUuid';
import { AddLyricsForSong } from '../domain/models/song/commands';
import { CreateSong } from '../domain/models/song/commands/create-song.command';
import { Song } from '../domain/models/song/song.entity';
import { AggregateId } from '../domain/types/AggregateId';
import { AggregateType } from '../domain/types/AggregateType';
import { MockIdManagementService } from '../lib/id-generation/mock-id-management.service';
import { NotFound } from '../lib/types/not-found';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoIdRepository } from '../persistence/repositories/arango-id-repository';
import { DeepPartial } from '../types/DeepPartial';
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

const dummyUuids: AggregateId[] = Array(10)
    .fill(0)
    .map((_, index) => buildDummyUuid(index));

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

describe(`CLI Command: ${cliCommandName}`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    const mockLogger = buildMockLogger({ isEnabled: false });

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = testAppModule.get(TestRepositoryProvider);

        idManager = new MockIdManagementService(new ArangoIdRepository(databaseProvider));

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(ID_MANAGER_TOKEN)
            .useValue(idManager)
            .overrideProvider(COSCRAD_LOGGER_TOKEN)
            .useValue(mockLogger)
            .compile();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();

        /**
         * Our current workaround for ID generation when bulk seeding data is
         * to seed the UUID collection in the DB with the desired (not randomly generated,
         * but with the correct format) UUIDs prior to executing the test commands
         * to seed data. We mimic this here.
         */
        await new ArangoIdRepository(databaseProvider).createMany(dummyUuids);

        await testRepositoryProvider.forResource(AggregateType.audioItem).create(existingAudioItem);

        jest.clearAllMocks();
    });

    const createCommandType = 'CREATE_SONG';

    const payloadOverridesForValidCreateCommand: DeepPartial<CreateSong> = {
        audioItemId: existingAudioItem.id,
        aggregateCompositeIdentifier: { id: dummyUuids[0] },
    };

    const serializedPayloadOverridesForCreateCommand = JSON.stringify(
        payloadOverridesForValidCreateCommand
    );

    const updateCommandType = 'ADD_LYRICS_FOR_SONG';

    const payloadOverridesForUpdateCommand: DeepPartial<AddLyricsForSong> = {
        aggregateCompositeIdentifier: {
            id: dummyUuids[0],
        },
        lyrics: 'fa de la la bla bla bla',
        languageCode: LanguageCode.English,
    };

    const serializedPayloadOverridesForUpdateCommand = JSON.stringify(
        payloadOverridesForUpdateCommand
    );

    describe(`when the command is valid`, () => {
        describe(`when executing a create command (requires ID generation)`, () => {
            it(`should succeed`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${createCommandType}`,
                    `--payload-overrides=${serializedPayloadOverridesForCreateCommand}`,
                ]);

                const newId = dummyUuids[0];

                const searchResult = await testRepositoryProvider
                    .forResource(AggregateType.song)
                    .fetchById(newId);

                expect(searchResult).not.toBe(NotFound);
            });
        });

        describe(`when execute an update command`, () => {
            it(`should update the data in the test database`, async () => {
                // First, we create the song itself so we can updated it
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${createCommandType}`,
                    `--payload-overrides=${serializedPayloadOverridesForCreateCommand}`,
                ]);

                // Add lyrics for the song we just created
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${updateCommandType}`,
                    `--payload-overrides=${serializedPayloadOverridesForUpdateCommand}`,
                ]);

                const songId = dummyUuids[0];

                const searchResult = await testRepositoryProvider
                    .forResource(AggregateType.song)
                    .fetchById(songId);

                expect(searchResult).not.toBe(NotFound);

                const doesSongHaveLyrics = (searchResult as Song).hasLyrics();

                expect(doesSongHaveLyrics).toBe(true);
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the payload overrides are invalid`, () => {
            describe(`when there is a superfluous property`, () => {
                it(`should fail with the expected error message`, async () => {
                    const overridesWithExtraProperty = {
                        ...payloadOverridesForValidCreateCommand,
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
            const payloadWithDuplicateLanguageForLyrics = {
                ...payloadOverridesForUpdateCommand,
                lyrics: `I am a second set of lyrics in the same langauge. Uh-oh!`,
            };

            const serializedInvalidPayload = JSON.stringify(payloadWithDuplicateLanguageForLyrics);

            it(`should fail`, async () => {
                // First, we create the song itself so we can updated it
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${createCommandType}`,
                    `--payload-overrides=${serializedPayloadOverridesForCreateCommand}`,
                ]);

                // Add lyrics for the song we just created
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${updateCommandType}`,
                    `--payload-overrides=${serializedPayloadOverridesForUpdateCommand}`,
                ]);

                // We only care about the log from the last run
                jest.clearAllMocks();

                // Add lyrics for the song we just created
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--type=${updateCommandType}`,
                    `--payload-overrides=${serializedInvalidPayload}`,
                ]);

                assertErrorMessageLogged(`cannot add lyrics`, mockLogger.log.mock.calls, [1, 0]);
            });
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
