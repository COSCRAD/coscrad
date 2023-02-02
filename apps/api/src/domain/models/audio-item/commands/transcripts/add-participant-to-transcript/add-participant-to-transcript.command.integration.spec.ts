import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { Transcript } from '../../../entities/transcript.entity';
import { AddParticipantToTranscript } from './add-participant-to-transcript.command';

const commandType = `ADD_PARTICIPANT_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: new Transcript({
        items: [],
        participants: [],
    }),
});

const validCommandFSA: FluxStandardAction<AddParticipantToTranscript> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingAudioItem.getCompositeIdentifier(),
        name: `Long Talkin' Johnny`,
        initials: 'LTJ',
    },
};

const systemUserId = buildDummyUuid(456);

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.audioItem]: [existingAudioItem],
}).fetchFullSnapshotInLegacyFormat();

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

    describe(`when the command is valid`, () => {
        it(`should succeed with the expected database updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                buildValidCommandFSA: () => validCommandFSA,
                systemUserId,
                initialState: validInitialState,
            });
        });
    });
});
