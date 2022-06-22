import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import { IIdManager } from '../../../domain/interfaces/id-manager.interface';
import { InternalError } from '../../../lib/errors/InternalError';
import { ArangoConnectionProvider } from '../../../persistence/database/arango-connection.provider';
import { DatabaseProvider } from '../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../types/DTO';
import { EnvironmentVariables } from '../../config/env.validation';
import createTestModule from './createTestModule';

type TestModuleInstances = {
    arangoConnectionProvider: ArangoConnectionProvider;
    databaseProvider: DatabaseProvider;
    testRepositoryProvider: TestRepositoryProvider;
    commandHandlerService: CommandHandlerService;
    app: INestApplication;
    idManager: IIdManager;
};

export default async (
    configOverrides: Partial<DTO<EnvironmentVariables>>,
    { shouldMockIdGenerator }: { shouldMockIdGenerator: boolean } = { shouldMockIdGenerator: false }
): Promise<TestModuleInstances> => {
    jest.resetModules();

    const moduleRef = await createTestModule(configOverrides, { shouldMockIdGenerator });

    const arangoConnectionProvider =
        moduleRef.get<ArangoConnectionProvider>(ArangoConnectionProvider);

    const databaseProvider = new DatabaseProvider(arangoConnectionProvider);

    const testRepositoryProvider = new TestRepositoryProvider(databaseProvider);

    const app = moduleRef.createNestApplication();

    await app.init();

    const commandHandlerService = moduleRef.get<CommandHandlerService>(CommandHandlerService);

    const idManager = moduleRef.get<IIdManager>('ID_MANAGER');

    if (
        !arangoConnectionProvider ||
        !databaseProvider ||
        !testRepositoryProvider ||
        !app ||
        !idManager
    ) {
        throw new InternalError(`Failed to initialize a testing module.`);
    }

    return {
        arangoConnectionProvider,
        databaseProvider,
        testRepositoryProvider,
        commandHandlerService,
        app,
        idManager,
    };
};
