import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import assertErrorAsExpected from '../../../../../lib/__tests__/assertErrorAsExpected';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestInstance } from '../../../../../test-data/utilities';
import { buildMultilingualTextWithSingleItem } from '../../../../common/build-multilingual-text-with-single-item';
import { MultilingualTextItemRole } from '../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../interfaces/id-manager.interface';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../types/DeluxeInMemoryStore';
import { assertCreateCommandError } from '../../../__tests__/command-helpers/assert-create-command-error';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { assertEventRecordPersisted } from '../../../__tests__/command-helpers/assert-event-record-persisted';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import AggregateIdAlreadyInUseError from '../../../shared/common-command-errors/AggregateIdAlreadyInUseError';
import CommandExecutionError from '../../../shared/common-command-errors/CommandExecutionError';
import InvalidExternalStateError from '../../../shared/common-command-errors/InvalidExternalStateError';
import { Term } from '../../entities/term.entity';
import { buildTestTerm } from '../../test-data/build-test-term';
import { CREATE_PROMPT_TERM } from './constants';
import { CreatePromptTerm } from './create-prompt-term.command';
import { PromptTermCreated } from './prompt-term-created.event';

const commandType = CREATE_PROMPT_TERM;

const rawData = {
    sourceProjectId: '22',
    originalTermId: '3456a',
    aspect: ``,
};

const commandPayload = buildTestInstance(CreatePromptTerm, {
    rawData,
});

const commandFsa = {
    type: 'CREATE_PROMPT_TERM',
    payload: commandPayload,
};

const buildValidCommandFSA = (id: AggregateId) =>
    clonePlainObjectWithOverrides(commandFsa, {
        payload: {
            aggregateCompositeIdentifier: {
                id,
            },
            rawData,
        },
    });

const prompt = commandFsa.payload.text;

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
                    // nothing to add
                    return Promise.resolve();
                },
                buildValidCommandFSA,
                checkStateOnSuccess: async ({
                    aggregateCompositeIdentifier: { id },
                }: CreatePromptTerm) => {
                    const searchResult = await testRepositoryProvider
                        .forResource(AggregateType.term)
                        .fetchById(id);

                    expect(searchResult).toBeInstanceOf(Term);

                    const term = searchResult as Term;

                    const termTextItem = term.text.getOriginalTextItem();

                    expect(termTextItem.text).toBe(prompt);

                    expect(termTextItem.role).toBe(MultilingualTextItemRole.original);

                    expect(termTextItem.languageCode).toBe(LanguageCode.English);

                    assertEventRecordPersisted(term, 'PROMPT_TERM_CREATED', dummySystemUserId);

                    const { eventHistory } = term;

                    const { rawData: rawDataFromEventHistory } = (
                        eventHistory[0] as PromptTermCreated
                    ).payload;

                    expect(rawDataFromEventHistory).toEqual(rawData);
                },
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when there is already a term with the given ID`, () => {
            it(`should fail with the expected errors`, async () => {
                const usedId = await idManager.generate();

                await assertCreateCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    seedInitialState: async () => {
                        await testRepositoryProvider.addFullSnapshot(
                            new DeluxeInMemoryStore({
                                term: [
                                    buildTestTerm({
                                        aggregateCompositeIdentifier: {
                                            id: usedId,
                                        },
                                        isPromptTerm: false,
                                        text: buildMultilingualTextWithSingleItem(
                                            'I have used that ID already',
                                            LanguageCode.English
                                        ),
                                    }),
                                ],
                            }).fetchFullSnapshotInLegacyFormat()
                        );
                    },
                    buildCommandFSA: (_id) => buildValidCommandFSA(usedId),
                    checkError: (error) => {
                        assertErrorAsExpected(
                            error,
                            new CommandExecutionError([
                                new InvalidExternalStateError([
                                    new AggregateIdAlreadyInUseError({
                                        type: AggregateType.term,
                                        id: usedId,
                                    }),
                                ]),
                            ])
                        );
                    },
                });
            });
        });
    });
});
