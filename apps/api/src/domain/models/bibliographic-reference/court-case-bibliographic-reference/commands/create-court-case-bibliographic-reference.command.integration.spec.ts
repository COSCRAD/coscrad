import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { InternalError } from '../../../../../lib/errors/InternalError';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../types/DTO';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../types/ResourceType';
import getValidBibliographicReferenceInstanceForTest from '../../../../__tests__/utilities/getValidBibliographicReferenceInstanceForTest';
import AggregateIdAlreadyInUseError from '../../../shared/common-command-errors/AggregateIdAlreadyInUseError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import UuidNotGeneratedInternallyError from '../../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { assertCommandFailsDueToTypeError } from '../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertResourcePersistedProperly } from '../../../__tests__/command-helpers/assert-resource-persisted-properly';
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';
import { CreateCourtCaseBibliographicReference } from './create-court-case-bibliographic-reference.command';
import { CreateCourtCaseBibliographicReferenceCommandHandler } from './create-court-case-bibliographic-reference.command-handler';

const commandType = 'CREATE_COURT_CASE_BIBLIOGRAPHIC_REFERENCE';

const initialState = new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat();

const newUuidToUse = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc246';

const existingCourtCaseBibliographicReference = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.courtCase
).clone({
    id: dummyUuid,
});

const testDatabaseName = generateDatabaseNameForTestSuite();

const buildValidCommandFSA = (
    id: AggregateId
): FluxStandardAction<DTO<CreateCourtCaseBibliographicReference>> => ({
    type: commandType,
    payload: {
        id,
        rawData: {
            foo: 'hello world court case',
        },
        caseName: 'BC Supreme Court vs. Some Innocent Person',
        abstract: 'The is the court case abstract.',
        dateDecided: '2020-4-23',
        court: 'BC Supreme Court',
        url: 'https://bcsupremecourt.com',
        pages: '47-78',
    },
});

const dummyFSAFactory = new DummyCommandFSAFactory(buildValidCommandFSA);

describe(`The command: ${commandType}`, () => {
    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let assertionHelperDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager } = await setUpIntegrationTest({
            ARANGO_DB_NAME: testDatabaseName,
        }));

        assertionHelperDependencies = {
            testRepositoryProvider,
            commandHandlerService,
            idManager,
        };

        commandHandlerService.registerHandler(
            commandType,
            new CreateCourtCaseBibliographicReferenceCommandHandler(
                testRepositoryProvider,
                idManager
            )
        );
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
                checkStateOnSuccess: async ({ id }: CreateCourtCaseBibliographicReference) => {
                    await assertResourcePersistedProperly(idManager, testRepositoryProvider, {
                        id,
                        type: ResourceType.bibliographicReference,
                    });
                },
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the payload has an invalid type', () => {
            generateCommandFuzzTestCases(CreateCourtCaseBibliographicReference).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value: ${invalidValue} ${description}`, () => {
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

    /**
     * TODO Ideally, we would remove duplication with other CreateBibliographicReference
     * test cases. However, there is currently some uncertainty as to our
     * modelling of the research subdomain, so we should wait to invest
     * time in this until we are certain we have it right.
     */
    describe('when there is already a Court Case Bibliographic Reference withthe same ID', () => {
        it('should fail with the expected error', async () => {
            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                buildCommandFSA: (_: AggregateId) =>
                    dummyFSAFactory.build(_, {
                        id: existingCourtCaseBibliographicReference.id,
                    }),
                initialState: new DeluxeInMemoryStore({
                    bibliographicReference: [existingCourtCaseBibliographicReference],
                }).fetchFullSnapshotInLegacyFormat(),
                checkError: (error: InternalError) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new InvalidExternalStateError([
                                new AggregateIdAlreadyInUseError({
                                    type: ResourceType.bibliographicReference,
                                    id: existingCourtCaseBibliographicReference.id,
                                }),
                            ]),
                        ])
                    );
                },
            });
        });
    });

    describe('when the id has a valid UUID format, but was not generated with our system', () => {
        it('should fail with the expected error', async () => {
            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                buildCommandFSA: (_: AggregateId) => dummyFSAFactory.build(newUuidToUse, {}),
                initialState,
                checkError: (error: InternalError) =>
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([
                            new UuidNotGeneratedInternallyError(newUuidToUse),
                        ])
                    ),
            });
        });
    });
});
