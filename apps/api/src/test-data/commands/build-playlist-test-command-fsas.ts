import { LanguageCode } from '@coscrad/api-interfaces';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(31);

const type = AggregateType.playlist;

const createPlaylist = {
    type: `CREATE_PLAYLIST`,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        name: 'dummy playlist name',
        languageCodeForName: LanguageCode.Chilcotin,
    },
};

export const buildPlaylistTestCommandFsas = () => [createPlaylist];
