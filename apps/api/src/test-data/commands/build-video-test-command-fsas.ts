import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { TranslateLineItem } from '../../domain/models/audio-item/commands';
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

export const buildVideoTestCommandFsas = () => [createVideo, translateLineItem];
