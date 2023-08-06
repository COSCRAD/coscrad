import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { CoscradEventFactory } from '../../../domain/common';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { CoscradUserWithGroups } from '../../../domain/models/user-management/user/entities/user/coscrad-user-with-groups';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { ArangoDatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../types/DTO';
import { EnvironmentVariables } from '../../config/env.validation';
import createTestModule from './createTestModule';

export type TestModuleInstances = {
    databaseProvider: ArangoDatabaseProvider;
    testRepositoryProvider: TestRepositoryProvider;
    commandHandlerService: CommandHandlerService;
    app: INestApplication;
    idManager: IIdManager;
};

type SetUpIntegrationTestOptions = {
    shouldMockIdGenerator: boolean;
    testUserWithGroups?: CoscradUserWithGroups;
};

export default async (
    configOverrides: Partial<DTO<EnvironmentVariables>>,
    userOptions: Partial<SetUpIntegrationTestOptions> = {}
): Promise<TestModuleInstances> => {
    jest.resetModules();

    const moduleRef = await createTestModule(configOverrides, userOptions).catch((error) => {
        throw error;
    });

    const arangoConnectionProvider =
        moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

    const databaseProvider = new ArangoDatabaseProvider(arangoConnectionProvider);

    const coscradEventFactory = moduleRef.get(CoscradEventFactory);

    const testRepositoryProvider = new TestRepositoryProvider(
        databaseProvider,
        coscradEventFactory
    );

    const app = moduleRef.createNestApplication();

    await app.init();

    const commandHandlerService = moduleRef.get<CommandHandlerService>(CommandHandlerService);

    const idManager = moduleRef.get<IIdManager>('ID_MANAGER');

    if (!databaseProvider || !testRepositoryProvider || !app || !idManager) {
        throw new InternalError(`Failed to initialize a testing module.`);
    }

    return {
        databaseProvider,
        testRepositoryProvider,
        commandHandlerService,
        app,
        idManager,
    };
};
