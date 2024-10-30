import { ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import ResourceNotFoundError from '../../../resource-not-found.error';
import { Resource } from '../../../resource.entity';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
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

    const eventSourcedResourceTypes = [
        ResourceType.term,
        ResourceType.vocabularyList,
        ResourceType.audioItem,
        ResourceType.song,
        ResourceType.digitalText,
    ];

    /**
     * TODO We need a test to show that this works for event sourced resources as well.
     * At the same time, whether a resource is event sourced or state based is
     * really an imnnplementation detail of the repository and doesn't
     * necessarily need to be known by the generic handler.
     */
    Object.values(ResourceType)
        .filter((t) => !eventSourcedResourceTypes.includes(t))
        // TODO remove this filter
        // .filter((t) => t === ResourceType.digitalText)
        .forEach((resourceType) => {
            const existingResource = getValidAggregateInstanceForTest(resourceType).clone({
                id: dummyUuid,
                hasBeenDeleted: false,
            });

            const buildCommandFSA = (): FluxStandardAction<DTO<DeleteResource>> => ({
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier: existingResource.getCompositeIdentifier(),
                },
            });

            const initialState = new DeluxeInMemoryStore({
                [resourceType]: [existingResource],
            }).fetchFullSnapshotInLegacyFormat();

            describe(`when deleting a resource of type ${formatAggregateType(
                resourceType
            )}`, () => {
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

                describe(`when the command is invalid`, () => {
                    describe(`when the resource does not exist`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: buildCommandFSA,
                                seedInitialState: async () => {
                                    Promise.resolve();
                                },
                                checkError: (result) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new AggregateNotFoundError(existingResource),
                                        ])
                                    );
                                },
                            });
                        });
                    });

                    describe(`when the resource has already been deleted`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: buildCommandFSA,
                                seedInitialState: async () => {
                                    const existingDeletedResource = existingResource.clone({
                                        hasBeenDeleted: true,
                                    });

                                    await testRepositoryProvider.addFullSnapshot(
                                        new DeluxeInMemoryStore({
                                            [resourceType]: [existingDeletedResource],
                                        }).fetchFullSnapshotInLegacyFormat()
                                    );
                                },
                                checkError: (result) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new ResourceNotFoundError(
                                                existingResource.getCompositeIdentifier()
                                            ),
                                        ])
                                    );
                                },
                            });
                        });
                    });
                });
            });
        });
});
