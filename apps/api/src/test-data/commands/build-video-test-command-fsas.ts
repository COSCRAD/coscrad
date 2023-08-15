import { LanguageCode } from '@coscrad/api-interfaces';
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
} from '../../domain/models/audio-item/commands/transcripts/constants';
import { TRANSLATE_LINE_ITEM } from '../../domain/models/audio-item/commands/transcripts/translate-line-item/constants';
import { CreateVideo } from '../../domain/models/video';
import { AggregateType } from '../../domain/types/AggregateType';

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

export const buildVideoTestCommandFsas = () => [
    createVideo,
    createTranscript,
    addParticipantToTranscript,
    addLineItemToTranscript,
    translateLineItem,
];
