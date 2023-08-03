import { LanguageCode, MultilingualTextItemRole } from '@coscrad/api-interfaces';
import { CommandHandlerService } from '@coscrad/commands';
import { INestApplication } from '@nestjs/common';
import setUpIntegrationTest from '../../../../../../app/controllers/__tests__/setUpIntegrationTest';
import { CommandFSA } from '../../../../../../app/controllers/command/command-fsa/command-fsa.entity';
import { clonePlainObjectWithOverrides } from '../../../../../../lib/utilities/clonePlainObjectWithOverrides';
import TestRepositoryProvider from '../../../../../../persistence/repositories/__tests__/TestRepositoryProvider';
import generateDatabaseNameForTestSuite from '../../../../../../persistence/repositories/__tests__/generateDatabaseNameForTestSuite';
import { buildTestCommandFsaMap } from '../../../../../../test-data/commands';
import getValidAggregateInstanceForTest from '../../../../../__tests__/utilities/getValidAggregateInstanceForTest';
import { buildMultilingualTextWithSingleItem } from '../../../../../common/build-multilingual-text-with-single-item';
import {
    MultilingualText,
    MultilingualTextItem,
} from '../../../../../common/entities/multilingual-text';
import { IIdManager } from '../../../../../interfaces/id-manager.interface';
import { AggregateType } from '../../../../../types/AggregateType';
import { DeluxeInMemoryStore } from '../../../../../types/DeluxeInMemoryStore';
import { assertCommandError } from '../../../../__tests__/command-helpers/assert-command-error';
import { assertCommandSuccess } from '../../../../__tests__/command-helpers/assert-command-success';
import { CommandAssertionDependencies } from '../../../../__tests__/command-helpers/types/CommandAssertionDependencies';
import { dummySystemUserId } from '../../../../__tests__/utilities/dummySystemUserId';
import { AudioVisualCompositeIdentifier } from '../../../entities/audio-item-composite-identifier';
import { AudioItem } from '../../../entities/audio-item.entity';
import { TranscriptItem } from '../../../entities/transcript-item.entity';
import { TranscriptParticipant } from '../../../entities/transcript-participant';
import { Transcript } from '../../../entities/transcript.entity';
import { Video } from '../../../entities/video.entity';
import { TranslateLineItem } from './translate-line-item.command';

const commandType = `TRANSLATE_LINE_ITEM`;

const testDatabaseName = generateDatabaseNameForTestSuite();

const dummyFsaMap = buildTestCommandFsaMap();

const dummyFsa = dummyFsaMap.get(commandType) as CommandFSA<TranslateLineItem>;

const targetSpeakerInitials = 'AP';

const existingMultilingualText = new MultilingualText({
    items: [
        new MultilingualTextItem({
            text: 'this is what was said (language)',
            languageCode: LanguageCode.Chilcotin,
            role: MultilingualTextItemRole.original,
        }),
    ],
});

const existingLineItem = new TranscriptItem({
    inPointMilliseconds: 1000.56,
    outPointMilliseconds: 3055.33,
    text: existingMultilingualText,
    speakerInitials: targetSpeakerInitials,
});

const existingTranscript = new Transcript({
    participants: [targetSpeakerInitials, 'JB'].map(
        (initials) =>
            new TranscriptParticipant({
                initials,
                name: `name of participant with initials: ${initials}`,
            })
    ),
    items: [existingLineItem],
});

const existingAudioItem = getValidAggregateInstanceForTest(AggregateType.audioItem).clone({
    transcript: existingTranscript,
});

const translation = `this is what was said (in English)`;

const translationLanguageCode = LanguageCode.English;

const buildValidFsa = (
    existingTranscribableResource: AudioItem | Video
): CommandFSA<TranslateLineItem> =>
    clonePlainObjectWithOverrides(dummyFsa, {
        payload: {
            aggregateCompositeIdentifier:
                existingTranscribableResource.getCompositeIdentifier() as AudioVisualCompositeIdentifier,
            inPointMilliseconds:
                existingTranscribableResource.transcript.items[0].inPointMilliseconds,
            outPointMilliseconds:
                existingTranscribableResource.transcript.items[0].outPointMilliseconds,
            translation,
            languageCode: translationLanguageCode,
        },
    });

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
        it(`should succeed with the expected database updates`, async () => {
            await assertCommandSuccess(assertionHelperDependencies, {
                systemUserId: dummySystemUserId,
                initialState: new DeluxeInMemoryStore({
                    [existingAudioItem.type]: [existingAudioItem],
                }).fetchFullSnapshotInLegacyFormat(),
                buildValidCommandFSA: () => buildValidFsa(existingAudioItem),
            });
        });
    });

    describe(`when the command is invalid`, () => {
        describe(`when the audio-visual resource does not exist`, () => {
            it(`should fail with the expected error`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({}).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => buildValidFsa(existingAudioItem),
                });
            });
        });

        describe(`when the line item already has text in this language`, () => {
            it(`should fail with the expected errors`, async () => {
                await assertCommandError(assertionHelperDependencies, {
                    systemUserId: dummySystemUserId,
                    initialState: new DeluxeInMemoryStore({
                        [existingAudioItem.type]: [
                            existingAudioItem.clone({
                                transcript: existingAudioItem.transcript.clone({
                                    items: [
                                        new TranscriptItem({
                                            inPointMilliseconds: 0,
                                            outPointMilliseconds: 0.001,
                                            speakerInitials: targetSpeakerInitials,
                                            text: buildMultilingualTextWithSingleItem(
                                                'I already have text in this language',
                                                translationLanguageCode
                                            ),
                                        }),
                                    ],
                                }),
                            }),
                        ],
                    }).fetchFullSnapshotInLegacyFormat(),
                    buildCommandFSA: () => buildValidFsa(existingAudioItem),
                });
            });
        });
    });
});
