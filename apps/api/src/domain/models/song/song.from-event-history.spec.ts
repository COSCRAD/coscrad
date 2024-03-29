/**
 * Note that currently, the event payload is strictly the payload from the
 * successful command FSA.
 */

import { LanguageCode } from '@coscrad/api-interfaces';
import { CommandFSA } from '../../../app/controllers/command/command-fsa/command-fsa.entity';
import { NotFound, isNotFound } from '../../../lib/types/not-found';
import { clonePlainObjectWithOverrides } from '../../../lib/utilities/clonePlainObjectWithOverrides';
import { buildTestCommandFsaMap } from '../../../test-data/commands';
import { TestEventStream } from '../../../test-data/events';
import { MultilingualTextItem } from '../../common/entities/multilingual-text';
import buildDummyUuid from '../__tests__/utilities/buildDummyUuid';
import {
    AddLyricsForSong,
    SongLyricsTranslated,
    TranslateSongLyrics,
    TranslateSongTitle,
} from './commands';
import { LyricsAddedForSong } from './commands/add-lyrics-for-song/lyrics-added-for-song.event';
import { CreateSong } from './commands/create-song.command';
import { SongCreated } from './commands/song-created.event';
import {
    ADD_LYRICS_FOR_SONG,
    LYRICS_ADDED_FOR_SONG,
    SONG_LYRICS_TRANSLATED,
    TRANSLATE_SONG_LYRICS,
} from './commands/translate-song-lyrics/constants';
import {
    SONG_TITLE_TRANSLATED,
    TRANSLATE_SONG_TITLE,
} from './commands/translate-song-title/constants';
import { SongTitleTranslated } from './commands/translate-song-title/song-title-translated.event';
import { Song } from './song.entity';

const id = buildDummyUuid(123);

const testFsaMap = buildTestCommandFsaMap();

const songTitle = `Foobar Jam`;

const languageCodeForTitle = LanguageCode.Chilcotin;

const songTitleTranslation = `FooBar Jam (In English though)`;

const translationLanguageCode = LanguageCode.English;

const textForLyrics = `La La La (in the language)`;

const translationForLyrics = `Fa Fa Fa (lyrics in English)`;

const createSong = clonePlainObjectWithOverrides(
    testFsaMap.get(`CREATE_SONG`) as CommandFSA<CreateSong>,
    {
        payload: {
            aggregateCompositeIdentifier: { id },
            title: songTitle,
            languageCodeForTitle,
        },
    }
);

const songCreated = new TestEventStream().andThen<SongCreated>({
    type: `SONG_CREATED`,
    payload: createSong.payload,
});

const translateSongTitle = clonePlainObjectWithOverrides(
    (testFsaMap.get(TRANSLATE_SONG_TITLE) as CommandFSA<TranslateSongTitle>).payload,
    {
        aggregateCompositeIdentifier: { id },
        translation: songTitleTranslation,
        languageCode: translationLanguageCode,
    }
);

const songTitleTranslated = songCreated.andThen<SongTitleTranslated>({
    type: SONG_TITLE_TRANSLATED,
    payload: translateSongTitle,
});

const addSongLyrics = clonePlainObjectWithOverrides(
    (testFsaMap.get(ADD_LYRICS_FOR_SONG) as CommandFSA<AddLyricsForSong>).payload,
    {
        aggregateCompositeIdentifier: { id },
        lyrics: textForLyrics,
        // we use the same "original" language throughout as that is the intended use at present
        languageCode: languageCodeForTitle,
    }
);

const lyricsAddedForSong = songTitleTranslated.andThen<LyricsAddedForSong>({
    type: LYRICS_ADDED_FOR_SONG,
    payload: addSongLyrics,
});

const translateSongLyrics = clonePlainObjectWithOverrides(
    (testFsaMap.get(TRANSLATE_SONG_LYRICS) as CommandFSA<TranslateSongLyrics>).payload,
    {
        aggregateCompositeIdentifier: { id },
        translation: translationForLyrics,
        languageCode: translationLanguageCode,
    }
);

const songLyricsTranslated = lyricsAddedForSong.andThen<SongLyricsTranslated>({
    type: SONG_LYRICS_TRANSLATED,
    payload: translateSongLyrics,
});

describe(`Song.fromEventHistory`, () => {
    describe(`when there are events for the given aggregate root`, () => {
        describe(`when there is only a creation event`, () => {
            const eventStream = songCreated.as({
                id,
            });

            it(`should succeed`, () => {
                const songBuildResult = Song.fromEventHistory(eventStream, id);

                expect(songBuildResult).toBeInstanceOf(Song);

                const song = songBuildResult as Song;

                const builtSongTitle = song.title.getTranslation(languageCodeForTitle);

                if (isNotFound(builtSongTitle)) {
                    throw new Error(`Song title not found!`);
                }

                expect(builtSongTitle.text).toBe(songTitle);
            });
        });

        describe(`when there is a translation for the title`, () => {
            const eventStream = songTitleTranslated.as({
                id,
            });

            it(`should have the correct title`, () => {
                const song = Song.fromEventHistory(eventStream, id) as Song;

                expect(
                    (song.title.getTranslation(translationLanguageCode) as MultilingualTextItem)
                        .text
                ).toBe(songTitleTranslation);
            });
        });

        describe(`when lyrics have been added`, () => {
            const eventStream = lyricsAddedForSong.as({ id });

            it(`should have the lyrics`, () => {
                const song = Song.fromEventHistory(eventStream, id) as Song;

                expect(song.hasLyrics()).toBe(true);

                expect(song.lyrics.getOriginalTextItem().text).toBe(textForLyrics);
            });
        });

        describe(`when the lyrics have been translated`, () => {
            const eventStream = songLyricsTranslated.as({ id });

            it(`should have translations for the lyrics`, () => {
                const song = Song.fromEventHistory(eventStream, id) as Song;

                expect(
                    (song.lyrics.getTranslation(translationLanguageCode) as MultilingualTextItem)
                        .text
                ).toBe(translationForLyrics);
            });
        });
    });

    describe(`when the first event is not a creation event for the given aggregate root`, () => {
        const eventStream = new TestEventStream()
            .andThen<SongTitleTranslated>({
                type: SONG_TITLE_TRANSLATED,
                payload: translateSongTitle,
            })
            .as({ id });

        it(`should throw`, () => {
            const attemptToBuildSong = () => Song.fromEventHistory(eventStream, id);

            expect(attemptToBuildSong).toThrow();
        });
    });

    describe(`when there are no events for the given Song`, () => {
        const eventStream = songTitleTranslated.as({ id });

        const bogusId = buildDummyUuid(456);

        it(`should return NotFound`, () => {
            const songBuildResult = Song.fromEventHistory(eventStream, bogusId);

            expect(songBuildResult).toBe(NotFound);
        });
    });
});
