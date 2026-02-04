import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test } from '@nestjs/testing';
import buildMockConfigService from '../../../../../app/config/__tests__/utilities/buildMockConfigService';
import { EdgeConnectionModule } from '../../../../../app/domain-modules/edge-connection.module';
import { CoscradEventFactory } from '../../../../../domain/common';
import {
    ID_MANAGER_TOKEN,
    IIdManager,
} from '../../../../../domain/interfaces/id-manager.interface';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import { PersistenceModule } from '../../../../../persistence/persistence.module';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { DynamicDataTypeFinderService, DynamicDataTypeModule } from '../../../../../validation';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { GrantUserReadAccessToNote } from './grant-user-read-access-to-note.command';

const commandType = 'GRANT_USER_READ_ACCESS_TO_NOTE';

const validCommandFsa = {
    type: commandType,
    payload: buildTestInstance(GrantUserReadAccessToNote,{
        aggregateCompositeIdentifier: ,
        
    }),
};

describe(commandType, () => {
    let app: INestApplication;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    let databaseProvider: ArangoDatabaseProvider;

    beforeAll(async () => {
        const testModule = await Test.createTestingModule({
            imports: [
                PersistenceModule.forRootAsync(),
                DynamicDataTypeModule,
                EdgeConnectionModule,
            ],
            providers: [
                {
                    provide: TestRepositoryProvider,
                    useFactory: (
                        databaseProvider: ArangoDatabaseProvider,
                        dynamicDataTypeFinderService: DynamicDataTypeFinderService
                    ) =>
                        new TestRepositoryProvider(
                            databaseProvider,
                            new CoscradEventFactory(dynamicDataTypeFinderService),
                            dynamicDataTypeFinderService
                        ),
                    inject: [ArangoDatabaseProvider, DynamicDataTypeFinderService],
                },
            ],
        })
            .overrideProvider(ConfigService)
            .useValue(
                buildMockConfigService({
                    ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
                })
            )
            .compile();

        app = testModule.createNestApplication();

        await app.init();

        commandAssertionDependencies = {
            testRepositoryProvider: app.get(TestRepositoryProvider),
            commandHandlerService: app.get(CommandHandlerService),
            idManager: app.get(ID_MANAGER_TOKEN),
        };

        databaseProvider = app.get(ArangoDatabaseProvider);
    });

    beforeEach(async () => {
        await commandAssertionDependencies.testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        await databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed`);
    });
});
