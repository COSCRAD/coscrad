import { FluxStandardAction, ResourceType } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { NotFound } from '../../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { DTO } from '../../../../../types/DTO';
import getValidAggregateInstanceForTest from '../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../__tests__/command-helpers/assert-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateNotFoundError from '../../../shared/common-command-errors/AggregateNotFoundError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import { ADD_PAGE_FOR_DIGITAL_TEXT, PAGE_ADDED_FOR_DIGITAL_TEXT } from '../../constants';
import DigitalTextPage from '../../digital-text-page.entity';
import { DigitalText } from '../../digital-text.entity';
import { CannotAddPageWithDuplicateIdentifierError } from '../../errors/cannot-add-page-with-duplicate-identifier.error';
import { AddPageForDigitalText } from './add-page-for-digital-text.command';

const commandType = ADD_PAGE_FOR_DIGITAL_TEXT;

const existingDigitalText = getValidAggregateInstanceForTest(AggregateType.digitalText).clone();

const duplicatedPageIdentifier = '12';

const newPageIdentifier = 'V';

const pageWithUniqueIdentifier = new DigitalTextPage({
    identifier: newPageIdentifier,
});

const existingDigitalTextWithPages = existingDigitalText.clone({
    pages: [
        new DigitalTextPage({
            identifier: duplicatedPageIdentifier,
        }),
        pageWithUniqueIdentifier,
    ],
});

const validPayload: AddPageForDigitalText = {
    aggregateCompositeIdentifier: existingDigitalText.getCompositeIdentifier(),
    identifier: duplicatedPageIdentifier,
};

const validCommandFSA = {
    type: commandType,
    payload: validPayload,
};

const buildValidCommandFSA = (): FluxStandardAction<DTO<AddPageForDigitalText>> => validCommandFSA;

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
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.digitalText]: [existingDigitalText],
                    }).fetchFullSnapshotInLegacyFormat(),
                    checkStateOnSuccess: async ({
                        aggregateCompositeIdentifier: { id: digitalTextId },
                    }: AddPageForDigitalText) => {
                        const digitalTextSearchResult = await testRepositoryProvider
                            .forResource(ResourceType.digitalText)
                            .fetchById(digitalTextId);

                        expect(digitalTextSearchResult).not.toBe(NotFound);

                        const digitalText = digitalTextSearchResult as DigitalText;

                        expect(digitalText.hasPages()).toBe(true);

                        assertEventRecordPersisted(
                            digitalText,
                            PAGE_ADDED_FOR_DIGITAL_TEXT,
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
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.digitalText]: [
                            existingDigitalText.clone({
                                pages: [pageWithUniqueIdentifier],
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                });
            });
        });
    });

    describe('when the command is invalid', () => {
        describe('when the digital text with the given composite identifier does not exist', () => {
            it('should fail with the expected errors', async () => {
                await assertCommandError(commandAssertionDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new AggregateNotFoundError(
                                    existingDigitalText.getCompositeIdentifier()
                                ),
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
                    initialState: new DeluxeInMemoryStore({
                        [AggregateType.digitalText]: [existingDigitalTextWithPages],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: buildValidCommandFSA,
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new CannotAddPageWithDuplicateIdentifierError(
                                    existingDigitalText.id,
                                    duplicatedPageIdentifier
                                ),
                            ])
                        );
                    },
                });
            });
        });
    });
});
