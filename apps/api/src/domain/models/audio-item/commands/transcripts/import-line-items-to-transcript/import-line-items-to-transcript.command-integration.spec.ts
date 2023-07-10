import {
    AggregateType,
    LanguageCode,
    ResourceCompositeIdentifier,
    ResourceType,
} from '@coscrad/api-interfaces';
import { CommandHandlerService, FluxStandardAction } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import getValidAggregateInstanceForTest from '../../../../../../domain/__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../../domain/common/build-multilingual-text-with-single-item';
import { IIdManager } from '../../../../../../domain/interfaces/id-manager.interface';
import { DeluxeInMemoryStore } from '../../../../../../domain/types/DeluxeInMemoryStore';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import formatAggregateType from '../../../../../../view-models/presentation/formatAggregateType';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import buildDummyUuid from '../../../../__tests__/utilities/buildDummyUuid';
import { AudioItem } from '../../../entities/audio-item.entity';
import { Video } from '../../../entities/video.entity';
import { ImportLineItemsToTranscript } from './import-line-items-to-transcript.command';

const commandType = `IMPORT_LINE_ITEMS_TO_TRANSCRIPT`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const systemUserId = buildDummyUuid();

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem);

const existingVideo = getValidAggregateInstanceForTest(AggregateType.video);

const validAudiovisualItems = [existingAudioItem, existingVideo];

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

    validAudiovisualItems.forEach((validInstance) => {
        describe(`when transcribing a ${formatAggregateType(validInstance.type)}`, () => {
            const [startTime, endTime] = validInstance.getTimeBounds();

            const audioLength = endTime - startTime;

            const numberOfTimestampsToGenerate = 10;

            const epsilon = 0.0001;

            const allTimestamps = Array(numberOfTimestampsToGenerate)
                .fill(0)
                .map((_, index) => [
                    startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
                    startTime +
                        ((index + 1) * audioLength) / numberOfTimestampsToGenerate -
                        epsilon,
                ]);

            const dummyText = 'bla bla bla';

            const languageCode = LanguageCode.Chilcotin;

            const multilingualText = buildMultilingualTextWithSingleItem(dummyText, languageCode);

            const buildValidCommandFSA = (
                validInstance: AudioItem | Video
            ): FluxStandardAction<ImportLineItemsToTranscript> => ({
                type: commandType,
                payload: {
                    aggregateCompositeIdentifier:
                        validInstance.getCompositeIdentifier() as ResourceCompositeIdentifier<
                            typeof ResourceType.audioItem | typeof ResourceType.video
                        >,
                    lineItems: [
                        {
                            inPointMilliseconds: allTimestamps[0][0],
                            outPointMilliseconds: allTimestamps[0][1],
                            text: dummyText,
                            languageCode,
                            speakerInitials: validInstance.transcript.participants[0].initials,
                        },
                    ],
                },
            });

            const validInitialState = new DeluxeInMemoryStore({
                [validInstance.type]: [validInstance],
            }).fetchFullSnapshotInLegacyFormat();

            const validCommandFSA = buildValidCommandFSA(validInstance);

            // const commandFSAFactory = new DummyCommandFsaFactory(() => validCommandFSA);

            describe(`when the command is valid`, () => {
                it(`should succeed wth the expected database updates`, async () => {
                    await assertCommandSuccess(assertionHelperDependencies, {
                        systemUserId,
                        buildValidCommandFSA: () => validCommandFSA,
                        initialState: validInitialState,
                    });
                });
            });
        });
    });
});
