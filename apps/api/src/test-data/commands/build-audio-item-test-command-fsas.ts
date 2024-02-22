import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    CREATE_AUDIO_ITEM,
    CreateAudioItem,
    TRANSLATE_AUDIO_ITEM_NAME,
    TranslateAudioItemName,
} from '../../domain/models/audio-visual/audio-item/commands';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(67);

const type = AggregateType.audioItem;

const createAudioItem: CommandFSA<CreateAudioItem> = {
    type: CREATE_AUDIO_ITEM,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        name: 'audio item name (language)',
        mediaItemId: buildDummyUuid(41),
        languageCodeForName: LanguageCode.Haida,
        lengthMilliseconds: 12345,
    },
};

const translateAudioItemName: CommandFSA<TranslateAudioItemName> = {
    type: TRANSLATE_AUDIO_ITEM_NAME,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        languageCode: LanguageCode.English,
        text: 'translation of audio name into English',
    },
};

export const buildAudioItemTestCommandFsas = () => [createAudioItem, translateAudioItemName];
