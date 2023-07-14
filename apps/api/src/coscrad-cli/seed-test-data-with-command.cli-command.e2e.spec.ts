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

const cliCommandName = `seed-test-data-with-command`;

describe(`CLI Command: ${cliCommandName}`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testAppModule = await createTestModule({
            ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
        });

        const arangoConnectionProvider =
            testAppModule.get<ArangoConnectionProvider>(ArangoConnectionProvider);

        databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

        testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

        commandInstance = await CommandTestFactory.createTestingCommand({
            imports: [CoscradCliModule],
        })
            .overrideProvider(AppModule)
            .useValue(testAppModule)
            .overrideProvider(REPOSITORY_PROVIDER_TOKEN)
            .useValue(testRepositoryProvider)
            .overrideProvider(ID_MANAGER_TOKEN)
            .useValue(new MockIdManagementService(new ArangoIdRepository(databaseProvider)))
            .compile();
    });

    describe(`when the command is valid`, () => {
        const commandType = 'CREATE_SONG';

        const dummyAudioUrl = 'https://www.foobar.baz/lalala.mp3';

        const payloadOverrides: Partial<CreateSong> = {
            audioURL: dummyAudioUrl,
        };

        const serializedPayloadOverrids = JSON.stringify(payloadOverrides);

        it(`should succeed`, async () => {
            await CommandTestFactory.run(commandInstance, [
                cliCommandName,
                `--type=${commandType}`,
                `--payload-overrides=${serializedPayloadOverrids}`,
            ]);

            const newId = 'foo123-replaceme-by-spying-on-id-generator';

            const searchResult = await testRepositoryProvider
                .forResource(AggregateType.song)
                .fetchById(newId);

            expect(searchResult).not.toBe(NotFound);
        });
    });
});
