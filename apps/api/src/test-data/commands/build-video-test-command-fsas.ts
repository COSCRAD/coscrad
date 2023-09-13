import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddLineItemToTranscript,
    AddParticipantToTranscript,
    CreateTranscript,
    TranslateLineItem,
} from '../../domain/models/audio-item/commands';
import {
    ADD_LINE_ITEM_TO_TRANSCRIPT,
    ADD_PARTICIPANT_TO_TRANSCRIPT,
    CREATE_TRANSCRIPT,
    IMPORT_LINE_ITEMS_TO_TRANSCRIPT,
} from '../../domain/models/audio-item/commands/transcripts/constants';
import { ImportLineItemsToTranscript } from '../../domain/models/audio-item/commands/transcripts/import-line-items-to-transcript';
import { TRANSLATE_LINE_ITEM } from '../../domain/models/audio-item/commands/transcripts/translate-line-item/constants';
import { CreateVideo, TranslateVideoName } from '../../domain/models/video';
import { TRANSLATE_VIDEO_NAME } from '../../domain/models/video/commands/constants';

const id = buildDummyUuid(91);

const type = AggregateType.video;

const createVideo: CommandFSA<CreateVideo> = {
    type: `CREATE_VIDEO`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        name: `Important Video`,
        languageCodeForName: LanguageCode.Haida,
        mediaItemId: buildDummyUuid(41),
        lengthMilliseconds: 12345,
    },
};

const translateVideoName: CommandFSA<TranslateVideoName> = {
    type: TRANSLATE_VIDEO_NAME,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        languageCode: LanguageCode.English,
        text: 'translation of video name into English',
    },
};

const createTranscript: CommandFSA<CreateTranscript> = {
    type: CREATE_TRANSCRIPT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
    },
};

const addParticipantToTranscript: CommandFSA<AddParticipantToTranscript> = {
    type: ADD_PARTICIPANT_TO_TRANSCRIPT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        name: 'Henrietta Longwinded',
        initials: 'HL',
    },
};

const addLineItemToTranscript: CommandFSA<AddLineItemToTranscript> = {
    type: ADD_LINE_ITEM_TO_TRANSCRIPT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        inPointMilliseconds: 105.6,
        outPointMilliseconds: 892.432,
        text: 'this is what was said (in English)',
        languageCode: LanguageCode.English,
        speakerInitials: 'HL',
    },
};

const translateLineItem: CommandFSA<TranslateLineItem> = {
    type: TRANSLATE_LINE_ITEM,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        inPointMilliseconds: 1000,
        outPointMilliseconds: 2500,
        translation: 'this is what was said translated to English',
        languageCode: LanguageCode.English,
    },
};

const [startTime, endTime] = [0, 1200000];

const audioLength = endTime - startTime;

const numberOfTimestampsToGenerate = 10;

const epsilon = 0.0001;

const allTimestamps = Array(numberOfTimestampsToGenerate)
    .fill(0)
    .map((_, index) => [
        startTime + epsilon + (index * audioLength) / numberOfTimestampsToGenerate,
        startTime + ((index + 1) * audioLength) / numberOfTimestampsToGenerate - epsilon,
    ]) as [number, number][];

const buildDummyText = ([inPoint, outPoint]: [number, number]) =>
    `text for line item with time range: [${inPoint}, ${outPoint}]`;

const buildLineItemForTimestamp = ([inPointMilliseconds, outPointMilliseconds]: [
    number,
    number
]) => ({
    inPointMilliseconds,
    outPointMilliseconds,
    text: buildDummyText([inPointMilliseconds, outPointMilliseconds]),
    languageCode: LanguageCode.Chilcotin,
    speakerInitials: 'LTJ',
});

const importLineItemsToTranscript: CommandFSA<ImportLineItemsToTranscript> = {
    type: IMPORT_LINE_ITEMS_TO_TRANSCRIPT,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        lineItems: allTimestamps.map(buildLineItemForTimestamp),
    },
};

export const buildVideoTestCommandFsas = () => [
    createVideo,
    translateVideoName,
    // Transcription Command FSAs
    createTranscript,
    addParticipantToTranscript,
    addLineItemToTranscript,
    translateLineItem,
    importLineItemsToTranscript,
];
