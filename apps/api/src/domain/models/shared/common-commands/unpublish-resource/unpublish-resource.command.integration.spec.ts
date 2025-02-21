import { ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../../types/DTO';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import { UnpublishResource } from './unpublish-resource.command';

const commandType = 'UNPUBLISH_RESOURCE';

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

    const resourceId = buildDummyUuid(1);

    describe(`when the command is valid`, () => {
        Object.values(ResourceType)
            // TODO [https://www.pivotaltracker.com/story/show/187855311] support event sourced resources
            .filter(
                (resourceType) =>
                    ![
                        ResourceType.term,
                        ResourceType.digitalText,
                        ResourceType.song,
                        ResourceType.vocabularyList,
                    ].includes(resourceType)
            )
            .forEach((resourceType) => {
                const publishedResource = getValidAggregateInstanceForTest(resourceType).clone({
                    id: resourceId,
                    published: true,
                });

                const buildCommandFSA = (): FluxStandardAction<DTO<UnpublishResource>> => ({
                    type: commandType,
                    payload: {
                        aggregateCompositeIdentifier: publishedResource.getCompositeIdentifier(),
                    },
                });

                const initialState = new DeluxeInMemoryStore({
                    [resourceType]: [publishedResource],
                }).fetchFullSnapshotInLegacyFormat();

                describe(`when unpublishing a resource of type: ${formatAggregateType(
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
                            });
                        });
                    });
                });
            });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the resource is not yet published`, () => {
            Object.values(ResourceType)
                // TODO support event sourced resources
                .filter(
                    (resourceType) =>
                        ![
                            ResourceType.term,
                            ResourceType.digitalText,
                            ResourceType.song,
                            ResourceType.vocabularyList,
                        ].includes(resourceType)
                )
                .forEach((resourceType) => {
                    const unpublishedResource = getValidAggregateInstanceForTest(
                        resourceType
                    ).clone({
                        published: false,
                    });

                    const buildCommandFSA = (): FluxStandardAction<DTO<UnpublishResource>> => ({
                        type: commandType,
                        payload: {
                            aggregateCompositeIdentifier:
                                unpublishedResource.getCompositeIdentifier(),
                        },
                    });

                    describe(`resource type: ${resourceType}`, () => {
                        it(`should fail with the expected error`, async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA: buildCommandFSA,
                                seedInitialState: async () => {
                                    await testRepositoryProvider
                                        .forResource(resourceType)
                                        .create(unpublishedResource);
                                },
                            });
                        });
                    });
                });
        });

        describe(`when the resource does not exist`, () => {
            Object.values(ResourceType)
                // TODO support event sourced resources
                .filter(
                    (resourceType) =>
                        ![ResourceType.term, ResourceType.digitalText, ResourceType.song].includes(
                            resourceType
                        )
                )
                .forEach((resourceType) => {
                    describe(`when there is no: ${resourceType}`, () => {
                        const resourceCompositeIdentifier = {
                            type: resourceType,
                            id: buildDummyUuid(5),
                        };

                        const buildCommandFSA = (): FluxStandardAction<DTO<UnpublishResource>> => ({
                            type: commandType,
                            payload: {
                                aggregateCompositeIdentifier: resourceCompositeIdentifier,
                            },
                        });

                        it(`should fail with the expected error`, async () => {
                            await assertCommandError(commandAssertionDependencies, {
                                systemUserId: dummySystemUserId,
                                buildCommandFSA,
                                seedInitialState: async () => {
                                    return Promise.resolve();
                                },
                                checkError: (result) => {
                                    assertErrorAsExpected(
                                        result,
                                        new CommandExecutionError([
                                            new AggregateNotFoundError(resourceCompositeIdentifier),
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
