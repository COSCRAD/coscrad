import { FluxStandardAction, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../../persistence/repositories/arango-event-repository';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { DTO } from '../../../../../types/DTO';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { DummyCommandFsaFactory } from '../../../__tests__/command-helpers/dummy-command-fsa-factory';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { CREATE_DIGITAL_TEXT } from '../../constants';
import { DigitalText } from '../../entities/digital-text.entity';
import { CannotAddPageWithDuplicateIdentifierError } from '../../errors/cannot-add-page-with-duplicate-identifier.error';
import { CreateDigitalText } from '../create-digital-text.command';
import { DigitalTextCreated } from '../digital-text-created.event';
import { AddPageToDigitalText } from './add-page-to-digital-text.command';
import { PageAddedToDigitalText } from './page-added-to-digital-text.event';

const commandType = `ADD_PAGE_TO_DIGITAL_TEXT`;

const dummyCreateDigitalTextFsa = buildTestCommandFsaMap().get(
    CREATE_DIGITAL_TEXT
) as CommandFSA<CreateDigitalText>;

const digitalTextId = buildDummyUuid(1);

const createExistingDigitalTextFsa = clonePlainObjectWithOverrides(dummyCreateDigitalTextFsa, {
    payload: {
        aggregateCompositeIdentifier: { id: digitalTextId },
    },
});

const creationEventForExistingDigitalText = new DigitalTextCreated(
    createExistingDigitalTextFsa.payload,
    buildDummyUuid(2),
    dummySystemUserId
);

const existingPageIdentifier = '12';

const newPageIdentifier = 'V';

const addPageCommand: AddPageToDigitalText = {
    aggregateCompositeIdentifier: { id: digitalTextId, type: AggregateType.digitalText },
    identifier: existingPageIdentifier,
};

const existingPageAddedEvent = new PageAddedToDigitalText(
    addPageCommand,
    buildDummyUuid(3),
    dummySystemUserId
    // TODO use timestamps
);

const validPayload: AddPageToDigitalText = {
    aggregateCompositeIdentifier: {
        type: AggregateType.digitalText,
        id: digitalTextId,
    },
    identifier: newPageIdentifier,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddPageToDigitalText>> => validCommandFSA;

const fsaFactory = new DummyCommandFsaFactory(buildValidCommandFSA);

describe(commandType, () => {
    let app: INestApplication;

    let databaseProvider: ArangoDatabaseProvider;

    let testRepositoryProvider: TestRepositoryProvider;

    let commandHandlerService: CommandHandlerService;

    let idManager: IIdManager;

    let commandAssertionDependencies: CommandAssertionDependencies;

    beforeAll(async () => {
        ({ testRepositoryProvider, commandHandlerService, idManager, app, databaseProvider } =
            await setUpIntegrationTest({
                ARANGO_DB_NAME: generateDatabaseNameForTestSuite(),
            }).catch((error) => {
                throw error;
            }));

        commandAssertionDependencies = {
            testRepositoryProvider,
            idManager,
            commandHandlerService,
        };
    });

    beforeEach(async () => {
        await testRepositoryProvider.testSetup();
    });

    afterAll(async () => {
        await app.close();

        databaseProvider.close();
    });

    describe('When the command is valid', () => {
        describe(`when the existing digital text has no pages`, () => {
            it('should succeed', async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvent(creationEventForExistingDigitalText);
                    },
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id: digitalTextId },
                    }: AddPageToDigitalText) => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).not.toBe(NotFound);

                        const digitalText = digitalTextSearchResult as DigitalText;

                        expect(digitalText.hasPages()).toBe(true);

                        assertEventRecordPersisted(
                            digitalText,
                            `PAGE_ADDED_TO_DIGITAL_TEXT`,
                            dummySystemUserId
                        );
                    },
                });
            });
        });

        describe(`when the existing digital text already has pages`, () => {
            it(`should succeed`, async () => {
                await assertCommandSuccess(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    buildValidCommandFSA,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents([
                                creationEventForExistingDigitalText,
                                existingPageAddedEvent,
                            ]);
                    },
                });
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the digital text with the given composite identifier does not exist', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        // Seed nothing
                        Promise.resolve();
                    },
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError({
                                    id: digitalTextId,
                                    type: AggregateType.digitalText,
                                }),
                            ])
                        );
                    },
                });
            });
        });

        describe('when there is already a page with the given identifier', () => {
            it('should fail with expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvents([
                                creationEventForExistingDigitalText,
                                existingPageAddedEvent,
                            ]);
                    },
                    buildCommandFSA: () =>
                        clonePlainObjectWithOverrides(buildValidCommandFSA(), {
                            payload: {
                                identifier: existingPageIdentifier,
                            },
                        }),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddPageWithDuplicateIdentifierError(
                                    digitalTextId,
                                    existingPageIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });

        describe(`when the page identifier consists of solely white space`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await app
                            .get(ArangoEventRepository)
                            .appendEvent(creationEventForExistingDigitalText);
                    },
                    buildCommandFSA: () =>
                        fsaFactory.build(undefined, {
                            identifier: '   ',
                        }),
                });
            });
        });

        describe(`when the page identifier includes white space or line breaks`, () => {
            [' A 1 ', 'B\t', '12\n'].forEach((invalidIdentifier) => {
                describe(`invalid page identifier: ${invalidIdentifier}`, () => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandError(commandAssertionDependencies, {
                            systemUserId: dummySystemUserId,
                            seedInitialState: async () => {
                                await app
                                    .get(ArangoEventRepository)
                                    .appendEvent(creationEventForExistingDigitalText);
                            },
                            buildCommandFSA: () =>
                                fsaFactory.build(undefined, {
                                    identifier: invalidIdentifier,
                                }),
                        });
                    });
                });
            });
        });

        describe(`when the page identifier is more than 9 characters long`, () => {
            const MAX_PAGE_IDENTIFIER_LENGTH_INCLUSIVE = 9;

            const invalidIdentifier = 'X'.repeat(MAX_PAGE_IDENTIFIER_LENGTH_INCLUSIVE + 1);

            describe(`invalid page identifier: ${invalidIdentifier}`, () => {
                it(`should fail with the expected error`, async () => {
                    await assertCommandError(commandAssertionDependencies, {
                        systemUserId: dummySystemUserId,
                        seedInitialState: async () => {
                            await app
                                .get(ArangoEventRepository)
                                .appendEvent(creationEventForExistingDigitalText);
                        },
                        buildCommandFSA: () =>
                            fsaFactory.build(undefined, {
                                identifier: invalidIdentifier,
                            }),
                    });
                });
            });
        });
    });
});
