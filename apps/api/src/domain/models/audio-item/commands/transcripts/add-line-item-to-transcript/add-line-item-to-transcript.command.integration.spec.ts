import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import {
    MultiLingualText,
    MultiLingualTextItemRole,
} from '../../../../../common/entities/multi-lingual-text';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { AddLineItemToTranscript } from './add-line-item-to-transcript.command';

const commandType = `ADD_LINE_ITEM_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid(464);

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const [audioStart, audioEnd] = existingAudioItem.getTimeBounds();

const audioLength = audioEnd - audioStart;

const numberOfTimestampsToGenerate = 10;

// offset to avoid collisions
const epsilon = 0.0001;

const allTimestamps = Array(numberOfTimestampsToGenerate)
    .fill(0)
    .map((_, index) => [
        audioStart + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
        audioStart + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
    ]);

const dummyText = new MultiLingualText({
    items: [
        {
            languageId: 'clc',
            text: 'lha lha lha',
            role: MultiLingualTextItemRole.original,
        },
        {
            languageId: 'eng',
            text: 'bla bla bla',
            role: MultiLingualTextItemRole.literalTranslation,
        },
    ],
}).toDTO();

const validCommandFSA: FluxStandardAction<AddLineItemToTranscript> = {
    type: commandType,
    payload: {
        aggregateCompositeIdentifier: existingAudioItem.getCompositeIdentifier(),
        inPointMilliseconds: allTimestamps[0][0],
        outPointMilliseconds: allTimestamps[0][1],
        text: dummyText,
        speakerInitials: existingAudioItem.transcript.participants[0].initials,
    },
};

const validInitialState = new DeluxeInMemoryStore({
    [AggregateType.audioItem]: [existingAudioItem],
}).fetchFullSnapshotInLegacyFormat();

describe(commandType, () => {
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
        it(`should succeed with the expected database udpates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId,
                buildValidCommandFSA: () => validCommandFSA,
                initialState: validInitialState,
            });
        });
    });
});
