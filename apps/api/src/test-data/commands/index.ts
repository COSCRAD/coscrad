import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import { AddLyricsForSong } from '../../domain/models/song/commands';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { AggregateType } from '../../domain/types/AggregateType';
import { buildSpatialFeatureTestCommandFsas } from './build-spatial-feature-test-command-fsas';
import { buildTermTestCommandFsas } from './build-term-test-command-fsas';

const id = buildDummyUuid(1);

const type = AggregateType.song;

const createSong: CommandFSA<CreateSong> = {
    // TODO Import a const for this
    type: 'CREATE_SONG',
    payload: {
        aggregateCompositeIdentifier: { id, type },
        title: 'test-song-name (language)',
        titleEnglish: 'test-song-name (English)',
        lyrics: 'la la la',
        audioURL: 'https://www.mysound.org/song.mp3',
    },
};

const addLyricsForSong: CommandFSA<AddLyricsForSong> = {
    type: 'ADD_LYRICS_FOR_SONG',
    payload: {
        aggregateCompositeIdentifier: {
            id,
            type,
        },
        lyrics: 'fa la la la la, is how it goes',
        languageCode: LanguageCode.English,
    },
};

const buildSongTestCommandFsas = () => [createSong, addLyricsForSong];

export const buildTestCommandFsaMap = () =>
    [
        ...buildSongTestCommandFsas(),
        ...buildTermTestCommandFsas(),
        ...buildSpatialFeatureTestCommandFsas(),
    ].reduce((fsaMap, nextFsa) => fsaMap.set(nextFsa.type, nextFsa), new Map<string, CommandFSA>());
