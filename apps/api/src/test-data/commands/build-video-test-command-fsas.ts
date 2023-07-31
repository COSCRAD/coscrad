import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
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

export const buildVideoTestCommandFsas = () => [createVideo];
