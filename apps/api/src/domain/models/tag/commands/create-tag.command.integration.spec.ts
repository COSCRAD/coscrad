import { FluxStandardAction } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../types/DTO';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { AggregateType } from '../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../types/DeluxeInMemoryStore';
import { HasAggregateId } from '../../../types/HasAggregateId';
import { assertCommandFailsDueToTypeError } from '../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../__tests__/utilities/dummyUuid';
import { CreateTag } from './create-tag.command';
import { CreateTagCommandHandler } from './create-tag.command-handler';

const commandType = 'CREATE_TAG';

const initialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

// const existingInstance = getValidAggregateInstanceForTest(AggregateType.tag);

const testDatabaseName = generateDatabaseNameForTestSuite();

const dummyTagLabel = 'plants';

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateTag>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: {
            type: AggregateType.tag,
            id,
        },
        label: dummyTagLabel,
    },
});

// const dummyCommandFSAFactory = new DummyCommandFSAFactory(buildValidCommandFSA);

describe(`The command: ${commandType}`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: testDatabaseName,
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };

        commandHandlerService.registerHandler(
            commandType,
            new CreateTagCommandHandler(testRepositoryProvider, idManager)
        );
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

    describe('when the command is valid', () => {
        it('should succeed with appropriate updates to the database', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA,
                initialState,
                systemUserId: dummySystemUserId,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateTag) => {
                    /**
                     * TODO
                     * Consider making `assertResourcePersistedProperly`
                     * into `assertAggregatePersistedProperly1.
                     */
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const searchResult = await testRepositoryProvider
                        .getTagRepository()
                        .fetchById(id);

                    expect(searchResult).not.toBe(NotFound);

                    expect(searchResult).not.toBeInstanceOf(InternalError);

                    expect((searchResult as HasAggregateId).id).toBe(id);
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the payload has an invalid type', () => {
            describe('when the aggregate type is wrong', () => {
                it('should fail with the appropriate error', async () => {
                    await assertCommandFailsDueToTypeError(
                        assertionHelperDependencies,
                        {
                            propertyName: 'aggregateCompositeIdentifier',
                            invalidValue: {
                                type: AggregateType.book,
                                id: dummyUuid,
                            },
                        },
                        buildValidCommandFSA('overwritten-id')
                    );
                });
            });

            generateCommandFuzzTestCases(CreateTag).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA('unused-id')
                            );
                        });
                    });
                }
            );
        });
    });
});
