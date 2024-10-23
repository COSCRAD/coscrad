import { ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../../types/DTO';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { Resource } from '../../../resource.entity';
import { DeleteResource } from './delete-resource.command';

const commandType = 'DELETE_RESOURCE';

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    afterAll(async () => {
        await app.close();
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    Object.values(ResourceType).forEach((resourceType) => {
        const existingResource = getValidAggregateInstanceForTest(resourceType).clone({
            id: dummyUuid,
            hasBeenDeleted: false,
        });

        const buildCommandFSA = (): FluxStandardAction<DTO<DeleteResource>> => ({
            type: commandType,
            payload: { aggregateCompositeIdentifier: existingResource.getCompositeIdentifier() },
        });

        const initialState = new DeluxeInMemoryStore({
            [resourceType]: [existingResource],
        }).fetchFullSnapshotInLegacyFormat();

        describe(`when deleting a resource of type ${formatAggregateType(resourceType)}`, () => {
            describe(`when the command is valid`, () => {
                it(`should succeed`, async () => {
                    await assertCommandSuccess(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        buildValidCommandFSA: buildCommandFSA,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(initialState);
                        },
                        checkStateOnSuccess: async () => {
                            const searchResult = await testRepositoryProvider
                                .forResource(existingResource.type)
                                .fetchById(existingResource.id);

                            expect(searchResult).not.toBeInstanceOf(Error);

                            const updatedResource = searchResult as Resource;

                            expect(updatedResource.hasBeenDeleted).toBe(true);
                        },
                    });
                });
            });
        });
    });
});
