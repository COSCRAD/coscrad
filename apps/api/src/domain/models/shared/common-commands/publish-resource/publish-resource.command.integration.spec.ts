import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../../lib/errors/InternalError';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../queries/presentation/formatAggregateType';
import { DTO } from '../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType, isResourceType } from '../../../../types/ResourceType';
import ResourceAlreadyPublishedError from '../../../ResourceAlreadyPublishedError';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { Resource } from '../../../resource.entity';
import AggregateNotFoundError from '../../common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../common-command-errors/CommandExecutionError';
import { PublishResource } from './publish-resource.command';

const commandType = 'PUBLISH_RESOURCE';

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
        const unpublishedResource = getValidAggregateInstanceForTest(resourceType).clone({
            // This must be a UUID or the command payload will fail type validation
            id: dummyUuid,
            published: false,
        });

        const buildCommandFSA = (): FluxStandardAction<DTO<PublishResource>> => ({
            type: commandType,
            payload: { aggregateCompositeIdentifier: unpublishedResource.getCompositeIdentifier() },
        });

        const initialState = new DeluxeInMemoryStore({
            [resourceType]: [unpublishedResource],
        }).fetchFullSnapshotInLegacyFormat();

        describe(`when publishing a resource of type: ${formatAggregateType(resourceType)}`, () => {
            describe('when the command is valid', () => {
                it('should succeed', async () => {
                    // TODO update this to use the new API
                    await assertCommandSuccess(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        buildValidCommandFSA: buildCommandFSA,
                        seedInitialState: async () => {
                            await testRepositoryProvider.addFullSnapshot(initialState);
                        },
                        checkStateOnSuccess: async () => {
                            const searchResult = await testRepositoryProvider
                                .forResource(unpublishedResource.type)
                                .fetchById(unpublishedResource.id);

                            expect(searchResult).not.toBeInstanceOf(Error);

                            const updatedResource = searchResult as Resource;

                            expect(updatedResource.published).toBe(true);
                        },
                    });
                });
            });

            describe('when the command is invalid', () => {
                describe('when the payload has an invalid type', () => {
                    Object.values(AggregateType)
                        .filter((type) => !isResourceType(type))
                        .forEach((nonResourceAggregateType) => {
                            describe(`when the aggregate type (${formatAggregateType(
                                nonResourceAggregateType
                            )}) is not for a resource`, () => {
                                it('should fail with the appropriate error', async () => {
                                    await assertCommandFailsDueToTypeError(
                                        commandAssertionDependencies,
                                        {
                                            propertyName: 'aggregateCompositeIdentifier',
                                            invalidValue: {
                                                type: nonResourceAggregateType,
                                                id: unpublishedResource.id,
                                            },
                                        },
                                        buildCommandFSA()
                                    );
                                });
                            });
                        });

                    generateCommandFuzzTestCases(PublishResource).forEach(
                        ({ description, propertyName, invalidValue }) => {
                            describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                                it('should fail with the appropriate error', async () => {
                                    await assertCommandFailsDueToTypeError(
                                        commandAssertionDependencies,
                                        { propertyName, invalidValue },
                                        buildCommandFSA()
                                    );
                                });
                            });
                        }
                    );

                    describe.only('when there is a bogusProperty', () => {
                        it('should fail with the expected error', async () => {
                            await assertCommandFailsDueToTypeError(
                                commandAssertionDependencies,
                                { propertyName: 'bogusProperty', invalidValue: 99 },
                                buildCommandFSA()
                            );
                        });
                    });
                });

                describe(`when the ${formatAggregateType(
                    resourceType
                )} is already published`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCommandError(commandAssertionDependencies, {
                            buildCommandFSA,
                            initialState: new DeluxeInMemoryStore({
                                [resourceType]: [unpublishedResource.clone({ published: true })],
                            }).fetchFullSnapshotInLegacyFormat(),
                            systemUserId: dummySystemUserId,
                            checkError: (error: InternalError) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new ResourceAlreadyPublishedError(
                                            unpublishedResource.getCompositeIdentifier()
                                        ),
                                    ])
                                );
                            },
                        });
                    });
                });

                describe(`when there is no ${formatAggregateType(
                    resourceType
                )} with the given composite identifier`, () => {
                    it('should fail with the expected error', async () => {
                        await assertCommandError(commandAssertionDependencies, {
                            systemUserId: dummySystemUserId,
                            buildCommandFSA,
                            initialState: new DeluxeInMemoryStore(
                                {}
                            ).fetchFullSnapshotInLegacyFormat(),
                            checkError: (error: InternalError) => {
                                assertErrorAsExpected(
                                    error,
                                    new CommandExecutionError([
                                        new AggregateNotFoundError(
                                            unpublishedResource.getCompositeIdentifier()
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
