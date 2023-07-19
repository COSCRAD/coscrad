import { TestingModule } from '@nestjs/testing';
import { CommandTestFactory } from 'nest-commander-testing';
import { AppModule } from '../app/app.module';
import createTestModule from '../app/controllers/__tests__/createTestModule';
import { ResourceType } from '../domain/types/ResourceType';
import { REPOSITORY_PROVIDER_TOKEN } from '../persistence/constants/persistenceConstants';
import { ArangoConnectionProvider } from '../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../persistence/database/database.provider';
import TestRepositoryProvider from '../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { CoscradCliModule } from './coscrad-cli.module';

const cliCommandName = 'execute-command-stream';

describe(`CLI Command: ${cliCommandName}`, () => {
    let commandInstance: TestingModule;

    let testRepositoryProvider: TestRepositoryProvider;

    let databaseProvider: ArangoDatabaseProvider;

    beforeEach(async () => {
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
            .compile();

        await testRepositoryProvider.testTeardown();
    });

    describe(`when the [name] property is specified`, () => {
        describe(`when the command is valid`, () => {
            const fixtureName = `users:create-admin`;

            describe(`when executing the command fixture with name: ${fixtureName}`, () => {
                it(`should succeed`, async () => {
                    await CommandTestFactory.run(commandInstance, [
                        cliCommandName,
                        `--name=${fixtureName}`,
                    ]);

                    const numberOfUsers = await testRepositoryProvider
                        .getUserRepository()
                        .getCount();

                    expect(numberOfUsers).toBeGreaterThan(0);
                });
            });
        });
    });

    describe(`when the [data-file] option is specified`, () => {
        describe(`when the command is valid`, () => {
            const dataFile = `apps/api/src/coscrad-cli/execute-command-stream.cli-command.SAMPLE.json`;

            it(`should succeed with the expected updates`, async () => {
                await CommandTestFactory.run(commandInstance, [
                    cliCommandName,
                    `--data-file=${dataFile}`,
                ]);

                const numberOfTerms = await testRepositoryProvider
                    .forResource(ResourceType.term)
                    .getCount();

                expect(numberOfTerms).toBeGreaterThan(0);
            });
        });
    });
});
