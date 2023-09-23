import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { IIdManager } from '../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../domain/types/DeluxeInMemoryStore';
import { clonePlainObjectWithOverrides } from '../../../../../lib/utilities/clonePlainObjectWithOverrides';
import { ArangoDatabaseProvider } from '../../../../../persistence/database/database.provider';
import TestRepositoryProvider from '../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../test-data/commands';
import { MultilingualTextItemRole } from '../../../../common/entities/multilingual-text';
import { AggregateId } from '../../../../types/AggregateId';
import { AggregateType } from '../../../../types/AggregateType';
import { assertCreateCommandSuccess } from '../../../__tests__/command-helpers/assert-create-command-success';
import { CommandAssertionDependencies } from '../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../__tests__/utilities/dummySystemUserId';
import { Term } from '../../entities/term.entity';
import { CREATE_PROMPT_TERM } from './constants';
import { CreatePromptTerm } from './create-prompt-term.command';

const commandType = CREATE_PROMPT_TERM;

const emptyInitialState = new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat();

const commandFsa = buildTestCommandFsaMap().get(CREATE_PROMPT_TERM) as CommandFSA<CreatePromptTerm>;

const buildValidCommandFSA = (id: AggregateId) =>
    clonePlainObjectWithOverrides(commandFsa, {
        payload: {
            aggregateCompositeIdentifier: {
                id,
            },
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
                initialState: emptyInitialState,
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
                },
            });
        });
    });
});
