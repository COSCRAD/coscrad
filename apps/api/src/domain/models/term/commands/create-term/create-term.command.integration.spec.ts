import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { Term } from '../../entities/term.entity';
import { buildTestTerm } from '../../test-data/build-test-term';
import { CreateTerm } from './create-term.command';

const commandType = `CREATE_TERM`;

const dummyFsa = buildTestCommandFsaMap().get(commandType);

const buildValidCommandFSA = (id: AggregateId) =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: { aggregateCompositeIdentifier: { id } },
    });

const commandFsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

describe(commandType, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterEach(async () => {
        await testRepositoryProvider.testTeardown();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected state updates`, async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                seedInitialState: async () => {
                    await Promise.resolve();
                },
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.term)
                        .fetchById(id);

                    expect(searchResult).not.toBe(NotFound);

                    expect(searchResult).not.toBeInstanceOf(Error);

                    const term = searchResult as Term;

                    assertEventRecordPersisted(term, `TERM_CREATED`, dummySystemUserId);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already a term with the given ID`, () => {
            it(`should return the expected error`, async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                const existingTerm = buildTestTerm({
                    aggregateCompositeIdentifier: {
                        id: newId,
                    },
                    isPromptTerm: false,
                    text: buildMultilingualTextWithSingleItem(
                        'test word (in language)',
                        LanguageCode.Chilcotin
                    ),
                });

                await testRepositoryProvider.addFullSnapshot(
                    new DeluxeInMemoryStore({
                        [AggregateType.term]: [existingTerm],
                    }).fetchFullSnapshotInLegacyFormat()
                );

                const result = await commandHandlerService.execute(validCommandFSA, {
                    userId: dummySystemUserId,
                });

                assertErrorAsExpected(result, new CommandExecutionError([]));
            });
        });

        describe('when the id has not been generated via our system', () => {
            it('should return the expected error', async () => {
                const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) => commandFsaFactory.build(bogusId),
                    seedInitialState: async () => {
                        await Promise.resolve();
                    },
                    // TODO Tighten up the error check
                });
            });
        });

        describe('when the payload has an invalid type', () => {
            describe(`when the payload has an invalid aggregate type`, () => {
                Object.values(AggregateType)
                    .filter((t) => t !== AggregateType.term)
                    .forEach((invalidAggregateType) => {
                        it(`should fail with the expected error`, async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                {
                                    propertyName: 'aggregateCompositeIdentifier',
                                    invalidValue: {
                                        type: invalidAggregateType,
                                        id: buildDummyUuid(15),
                                    },
                                },
                                buildValidCommandFSA(buildDummyUuid(12))
                            );
                        });
                    });
            });

            generateCommandFuzzTestCases(CreateTerm).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                        it('should fail with the appropriate error', async () => {
                            await assertCommandFailsDueToTypeError(
                                assertionHelperDependencies,
                                { propertyName, invalidValue },
                                buildValidCommandFSA(buildDummyUuid(123))
                            );
                        });
                    });
                }
            );
        });
    });
});
