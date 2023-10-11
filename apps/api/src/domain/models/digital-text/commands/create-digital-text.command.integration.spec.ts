import {
    AggregateType,
    FluxStandardAction,
    LanguageCode,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../lib/__tests__/assertErrorAsExpected';
import { InternalError } from '../../../../lib/errors/InternalError';
import { NotAvailable } from '../../../../lib/types/not-available';
import { NotFound } from '../../../../lib/types/not-found';
import { ArangoDatabaseProvider } from '../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { ArangoEventRepository } from '../../../../persistence/repositories/arango-event-repository';
import { DTO } from '../../../../types/DTO';
import { IIdManager } from '../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../types/AggregateId';
import { assertCommandFailsDueToTypeError } from '../../__tests__/command-helpers/assert-command-payload-type-error';
import { assertCreateCommandError } from '../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../__tests__/command-helpers/assert-event-record-persisted';
import { generateCommandFuzzTestCases } from '../../__tests__/command-helpers/generate-command-fuzz-test-cases';
import { CommandAssertionDependencies } from '../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../__tests__/utilities/dummyDateNow';
import {
    dummySystemUserId as dummyAdminUserId,
    dummySystemUserId,
} from '../../__tests__/utilities/dummySystemUserId';
import CommandExecutionError from '../../shared/common-command-errors/CommandExecutionError';
import UuidNotGeneratedInternallyError from '../../shared/common-command-errors/UuidNotGeneratedInternallyError';
import { CREATE_DIGITAL_TEXT, DIGITAL_TEXT_CREATED } from '../constants';
import { DigitalText } from '../digital-text.entity';
import { CreateDigitalText } from './create-digital-text.command';
import { DigitalTextCreated } from './digital-text-created.event';

const commandType = CREATE_DIGITAL_TEXT;

const titleForNewDigitalText = 'test-digital-text-name (language)';

const languageCodeForNewDigitalText = LanguageCode.Haida;

const buildValidCommandFSA = (id: AggregateId): FluxStandardAction<DTO<CreateDigitalText>> => ({
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: { id, type: AggregateType.digitalText },
        title: titleForNewDigitalText,
        languageCodeForTitle: languageCodeForNewDigitalText,
    },
});

const buildInvalidFSA = (
    id: AggregateId,
    payloadOverrides: Partial<Record<keyof CreateDigitalText, unknown>> = {}
): FluxStandardAction<DTO<CreateDigitalText>> => ({
    type: commandType,
    payload: {
        ...buildValidCommandFSA(id).payload,
        ...(payloadOverrides as Partial<CreateDigitalText>),
    },
});

const seedEmptyInitialState = async () => {
    Promise.resolve();
};

describe('CreateDigitalText', () => {
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

    describe('when the command is valid', () => {
        it('should succeed', async () => {
            await assertCreateCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA,
                seedInitialState: seedEmptyInitialState,
                systemUserId: dummyAdminUserId,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreateDigitalText) => {
                    const idStatus = await idManager.status(id);

                    expect(idStatus).toBe(NotAvailable);

                    const digitalTextSearchResult = await testRepositoryProvider
                        .forResource<DigitalText>(ResourceType.digitalText)
                        .fetchById(id);

                    expect(digitalTextSearchResult).not.toBe(NotFound);

                    expect(digitalTextSearchResult).not.toBeInstanceOf(InternalError);

                    expect((digitalTextSearchResult as DigitalText).id).toBe(id);

                    const digitalText = digitalTextSearchResult as DigitalText;

                    const { text: persistedTitle, languageCode: persistedLanguageCode } =
                        digitalText.title.getOriginalTextItem();

                    const {
                        title: payloadTitle,
                        languageCodeForTitle: payloadLanguageCodeForTitle,
                    } = buildValidCommandFSA(id).payload;

                    expect(persistedTitle).toEqual(payloadTitle);

                    expect(persistedLanguageCode).toEqual(payloadLanguageCodeForTitle);

                    assertEventRecordPersisted(digitalText, DIGITAL_TEXT_CREATED, dummyAdminUserId);
                },
            });
        });
    });

    /**
     * We build this test case without the helpers because of the complication
     * of using the generated ID as part of the initial state.
     */
    describe('when the external state is invalid', () => {
        describe.only(`when there is already a digital text with the same title`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        const creationCommand: CreateDigitalText = {
                            aggregateCompositeIdentifier: {
                                type: AggregateType.digitalText,
                                id: buildDummyUuid(567),
                            },
                            title: titleForNewDigitalText,
                            languageCodeForTitle: languageCodeForNewDigitalText,
                        };

                        const creationEventForDigitalTextWithSameTitle = new DigitalTextCreated(
                            creationCommand,
                            buildDummyUuid(111),
                            dummySystemUserId,
                            dummyDateNow
                        );

                        await app
                            .get(ArangoEventRepository)
                            .appendEvent(creationEventForDigitalTextWithSameTitle);

                        console.log('done');
                    },
                    buildCommandFSA: buildValidCommandFSA,
                });
            });
        });

        describe('when there is already a digital text with the given ID', () => {
            it('should return the expected error', async () => {
                const newId = await idManager.generate();

                const validCommandFSA = buildValidCommandFSA(newId);

                // add the digital text for the first time
                await commandHandlerService.execute(validCommandFSA, {
                    userId: dummyAdminUserId,
                });

                // attempt to add a second digital text with the same ID
                const result = await commandHandlerService.execute(validCommandFSA, {
                    userId: dummyAdminUserId,
                });

                expect(result).toBeInstanceOf(InternalError);
            });
        });
    });

    describe('when the id has not been generated via our system', () => {
        it('should return the expected error', async () => {
            const bogusId = '4604b265-3fbd-4e1c-9603-66c43773aec0';

            await assertCreateCommandError(assertionHelperDependencies, {
                systemUserId: dummyAdminUserId,
                buildCommandFSA: (_: AggregateId) => buildInvalidFSA(bogusId),
                seedInitialState: seedEmptyInitialState,
                checkError: (error: InternalError) => {
                    assertErrorAsExpected(
                        error,
                        new CommandExecutionError([new UuidNotGeneratedInternallyError(bogusId)])
                    );
                },
            });
        });
    });

    /**
     * TODO Test these at a lower level that avoids the network.
     */
    describe('when the payload has an invalid type', () => {
        describe(`when the payload has an invalid aggregate type`, () => {
            Object.values(AggregateType)
                .filter((t) => t !== AggregateType.digitalText)
                .forEach((invalidAggregateType) => {
                    it(`should fail with the expected error`, async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            {
                                propertyName: 'aggregateCompositeIdentifier',
                                invalidValue: {
                                    type: invalidAggregateType,
                                    id: buildDummyUuid(16),
                                },
                            },
                            buildValidCommandFSA(buildDummyUuid(13))
                        );
                    });
                });
        });

        generateCommandFuzzTestCases(CreateDigitalText).forEach(
            ({ description, propertyName, invalidValue }) => {
                describe(`when the property: ${propertyName} has the invalid value:${invalidValue} (${description}`, () => {
                    it('should fail with the appropriate error', async () => {
                        await assertCommandFailsDueToTypeError(
                            assertionHelperDependencies,
                            { propertyName, invalidValue },
                            buildValidCommandFSA(buildDummyUuid(127))
                        );
                    });
                });
            }
        );
    });
});
