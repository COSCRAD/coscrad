import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { BibliographicSubjectCreatorType } from '@coscrad/data-types';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { assertResourcePersistedProperly } from '../../../../../domain/models/__tests__/command-helpers/assert-resource-persisted-properly';
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
import { DummyCommandFSAFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { generateCommandFuzzTestCases } from '../../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { dummyUuid } from '../../../__tests__/utilities/dummyUuid';
import { BibliographicReferenceType } from '../../types/BibliographicReferenceType';
import { CreateJournalArticleBibliographicReference } from './create-journal-article-bibliographic-reference.command';
import { CreateJournalArticleBibliographicReferenceCommandHandler } from './create-journal-article-bibliographic-reference.command-handler';

const commandType = 'CREATE_JOURNAL_ARTICLE_BIBLIOGRAPHIC_REFERENCE';

const initialState = new DeluxeInMemoryStore().fetchFullSnapshotInLegacyFormat();

const newUuidToUse = '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dc002';

const existingJournalArticleBibliographicReference = getValidBibliographicReferenceInstanceForTest(
    BibliographicReferenceType.journalArticle
).clone({
    id: dummyUuid,
});

const testDatabaseName = generateDatabaseNameForTestSuite();

const buildValidCommandFSA = (
    id: AggregateId
): FluxStandardAction<DTO<CreateJournalArticleBibliographicReference>> => ({
    type: commandType,
    payload: {
        id,
        rawData: {
            foo: 'hello world',
        },
        title: 'TLDR',
        creators: [
            {
                type: BibliographicSubjectCreatorType.author,
                name: 'Dr. Johnny McPhullovit',
            },
        ],
        abstract: 'Blah, blah, blah- this is the abstract.',
        issueDate: 'Spring 2003',
        publicationTitle: 'Metaphysical Review G',
        url: 'https://www.myboguspublication.com/123234.pdf',
        // TODO provide a more realistic example
        pages: 'What is this property for? FIX ME FIX ME FIX ME',
        issn: '0378-5955',
        doi: 'https://dx.doi.org/10.1093/ajae/aaq063',
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
            new CreateJournalArticleBibliographicReferenceCommandHandler(
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
                checkStateOnSuccess: async ({ id }: CreateJournalArticleBibliographicReference) => {
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
            generateCommandFuzzTestCases(CreateJournalArticleBibliographicReference).forEach(
                ({ description, propertyName, invalidValue }) => {
                    describe(`when the property: ${propertyName} has the invalid value: ${invalidValue} (${description}`, () => {
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

        /**
         * TODO Ideally, we would remove duplication with other CreateBibliographicReference
         * test cases. However, there is currently some uncertainty as to our
         * modelling of the research subdomain, so we should wait to invest
         * time in this until we are certain we have it right.
         */
        describe('when there is already a Book Bibliographic Reference with the same ID', () => {
            it('should fail with the expected error', async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    buildCommandFSA: (_: AggregateId) =>
                        dummyFSAFactory.build(_, {
                            id: existingJournalArticleBibliographicReference.id,
                        }),
                    initialState: new DeluxeInMemoryStore({
                        bibliographicReference: [existingJournalArticleBibliographicReference],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkError: (error: InternalError) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateIdAlreadyInUseError({
                                        type: ResourceType.bibliographicReference,
                                        id: existingJournalArticleBibliographicReference.id,
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
});
