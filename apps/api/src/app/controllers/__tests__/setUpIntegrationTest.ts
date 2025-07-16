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
import { DynamicDataTypeFinderService } from '../../../validation';
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

/**
 * @deprecated This legacy test setup helper is no longer necessary. It was a
 * nightmare to maintain, and also gave us false confidence by mocking
 * bypassing modules. While `e2e` tests are more important for the latter point,
 * the maintenance issue is real.
 *
 * Use the lower level `Test` module from `NestJS` to set up command and event handler
 * and query tests.
 *
 * See `literal-translation-of-term-provided.event-handler.integration.spec.ts` or
 * `provide-literal-translation-of-term.command.integration.spec.ts` for examples.
 *
 * We will not bother to refactor existing uses in tests except when we have a
 * productive reason to touch said test files.
 */
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
        coscradEventFactory,
        moduleRef.get(DynamicDataTypeFinderService)
    );

    const app = moduleRef.createNestApplication();

    await app.init();
    const commandHandlerService = moduleRef.get<CommandHandlerService>(CommandHandlerService);

    const idManager = moduleRef.get<IIdManager>('ID_MANAGER');

    if (!databaseProvider || !testRepositoryProvider || !app || !idManager) {
        throw new InternalError(`Failed to initialize a testing module.`);
    }

    /**
     * This ensures that union types, for example, are resolved.
     */
    await app.get(DynamicDataTypeFinderService).bootstrapDynamicTypes();

    return {
        databaseProvider,
        testRepositoryProvider,
        commandHandlerService,
        app,
        idManager,
    };
};
