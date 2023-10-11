import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../app/controllers/command/command-fsa/command-fsa.entity';
import buildDummyUuid from '../../domain/models/__tests__/utilities/buildDummyUuid';
import {
    AddLyricsForSong,
    TranslateSongLyrics,
    TranslateSongTitle,
} from '../../domain/models/song/commands';
import { CreateSong } from '../../domain/models/song/commands/create-song.command';
import { TRANSLATE_SONG_LYRICS } from '../../domain/models/song/commands/translate-song-lyrics/constants';
import { TRANSLATE_SONG_TITLE } from '../../domain/models/song/commands/translate-song-title/constants';
import { AggregateType } from '../../domain/types/AggregateType';

const id = buildDummyUuid(1);

const type = AggregateType.song;

const createSong: CommandFSA<CreateSong> = {
    // TODO Import a const for this
    type: 'CREATE_SONG',
    payload: {
        aggregateCompositeIdentifier: { id, type },
        title: 'test-song-name (language)',
        languageCodeForTitle: LanguageCode.English,
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
        languageCode: LanguageCode.Haida,
    },
};

const translateSongLyrics: CommandFSA<TranslateSongLyrics> = {
    type: TRANSLATE_SONG_LYRICS,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        translation: `fo lo lo (in English)`,
        languageCode: LanguageCode.English,
    },
};

const translateSongTitle: CommandFSA<TranslateSongTitle> = {
    type: TRANSLATE_SONG_TITLE,
    payload: {
        aggregateCompositeIdentifier: { id, type },
        translation: 'title translation to chilcotin',
        languageCode: LanguageCode.Chilcotin,
    },
};

export const buildSongTestCommandFsas = () => [
    createSong,
    addLyricsForSong,
    translateSongLyrics,
    translateSongTitle,
];
