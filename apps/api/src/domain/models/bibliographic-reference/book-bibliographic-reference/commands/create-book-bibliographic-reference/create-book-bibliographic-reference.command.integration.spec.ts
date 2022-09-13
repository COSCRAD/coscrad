import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { assertResourcePersistedProperly } from '../../../../../../domain/models/__tests__/command-helpers/assert-resource-persisted-properly';
import getValidBibliographicReferenceInstanceForTest from '../../../../../../domain/__tests__/utilities/getValidBibliographicReferenceInstanceForTest';
import { InternalError } from '../../../../../../lib/errors/InternalError';
import assertErrorAsExpected from '../../../../../../lib/__tests__/assertErrorAsExpected';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { DTO } from '../../../../../../types/DTO';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../../types/AggregateId';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { ResourceType } from '../../../../../types/ResourceType';
import AggregateIdAlreadyInUseError from '../../../../shared/common-command-errors/AggregateIdAlreadyInUseError';
import CommandExecutionError from '../../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../../shared/common-command-errors/InvalidExternalStateError';
import UuidNotAvailableForUseError from '../../../../shared/common-command-errors/UuidNotAvailableForUseError';
import UuidNotGeneratedInternallyError from '../../../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { assertCommandFailsDueToTypeError } from '../../../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../../__tests__/command-helpers/assert-create-command-success';
import { DummyCommandFSAFactory } from '../../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummyIsbn } from '../../../../__tests__/utilities/dummyIsbn';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../../__tests__/utilities/dummyUuid';
import { BibliographicReferenceType } from '../../../types/BibliographicReferenceType';
import { CreateBookBibliographicReference } from './create-book-bibliographic-reference.command';
import { CreateBookBibliographicReferenceCommandHandler } from './create-book-bibliographic-reference.command-handler';

const commandType = 'CREATE_BOOK_BIBLIOGRAPHIC_REFERENCE';

const initialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const dummyNewUuid = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc002';

const existingInstance = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.book
).clone({
    id: dummyUuid,
});

const testDatabaseName = generateDatabaseNameForTestSuite();

const buildValidCommandFSA = (
    id: AggregateId
): FluxStandardAction<DTO<CreateBookBibliographicReference>> => ({
    type: commandType,
    payload: {
        id,
        title: 'old dusty book',
        creators: [
            {
                type: BibliographicSubjectCreatorType.author,
                name: 'Scandalous McGee',
            },
        ],
        abstract: 'one filthy book',
        year: 1945,
        publisher: 'Printing Press Automated Publishers',
        place: 'Nowheresville, Canada',
        url: 'https://www.goodreadsarchive.com/foo.pdf',
        numberOfPages: 102,
        isbn: dummyIsbn,
    },
});

const dummyCommandFSAFactory = new DummyCommandFSAFactory(buildValidCommandFSA);

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
            new CreateBookBibliographicReferenceCommandHandler(testRepositoryProvider, idManager)
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
                checkStateOnSuccess: async ({ id }: CreateBookBibliographicReference) => {
                    await assertResourcePersistedProperly(idManager, testRepositoryProvider, {
                        id,
                        type: ResourceType.bibliographicReference,
                    });
                },
            });
        });
    });

    describe('when the payload has an invalid type', () => {
        generateCommandFuzzTestCases(CreateBookBibliographicReference).forEach(
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

    describe('when the command is invalid', () => {
        describe(`when there is already a Book Bibliographic Reference with the same ID`, () => {
            it('should fail with the expected error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) =>
                        dummyCommandFSAFactory.build(_, {
                            id: existingInstance.id,
                        }),
                    initialState: new DeluxeInMemoryStore({
                        bibliographicReference: [existingInstance],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error: InternalError) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateIdAlreadyInUseError({
                                        type: ResourceType.bibliographicReference,
                                        id: existingInstance.id,
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
                    buildCommandFSA: (_: AggregateId) =>
                        dummyCommandFSAFactory.build(dummyNewUuid, {}),
                    initialState,
                    checkError: (error: InternalError) =>
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new UuidNotGeneratedInternallyError(dummyNewUuid),
                            ])
                        ),
                });
            });
        });

        /**
         * Note that this should really be caught via the external state check
         * for other aggregates of this type with the same ID. It requires a
         * system error to get into this state. I.e. a system-generated ID must
         * be marked as in use, even though no aggregate with said ID actually
         * is persisted.
         *
         * That said, this may save us if we get to the point of doing `soft deletes`,
         * in which case we do not want IDs from deleted entities to be able to be
         * used. We'll cross this bridge in due time.
         */
        describe('when the id was generated by our system, but is not available for use', () => {
            it('should fail with the expected error', async () => {
                /**
                 * Because UUIDs don't fit naturally within the standard
                 * hierarchy of aggregates in our system, and because the
                 * IdRepository has a non-standard repository API, we elected
                 * to do this additional setup for the current test case here.
                 */
                await testRepositoryProvider.getIdRepository().create(dummyNewUuid);

                await testRepositoryProvider.getIdRepository().reserve(dummyNewUuid);

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) =>
                        dummyCommandFSAFactory.build(dummyNewUuid, {
                            id: dummyNewUuid,
                        }),
                    initialState,
                    checkError: (error: InternalError) =>
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new UuidNotAvailableForUseError(dummyNewUuid),
                            ])
                        ),
                });
            });
        });
    });
});
