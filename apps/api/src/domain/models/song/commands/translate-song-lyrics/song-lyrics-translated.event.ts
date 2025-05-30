import { AggregateType, LanguageCode } from '@coscrad/api-interfaces';
import { CoscradDataExample } from '../../../../../test-data/utilities';
import { CoscradEvent } from '../../../../common';
import buildDummyUuid from '../../../__tests__/utilities/buildDummyUuid';
import { dummyDateNow } from '../../../__tests__/utilities/dummyDateNow';
import { BaseEvent } from '../../../shared/events/base-event.entity';
import { SONG_LYRICS_TRANSLATED } from './constants';
import { TranslateSongLyrics } from './translate-song-lyrics.command';

export type SongLyricsTranslatedPayload = TranslateSongLyrics;

const testEventId = buildDummyUuid(1);

@CoscradDataExample<SongLyricsTranslated>({
    example: {
        id: testEventId,
        type: 'SONG_LYRICS_TRANSLATED',
        meta: {
            id: testEventId,
            dateCreated: dummyDateNow,
            contributorIds: [],
            userId: buildDummyUuid(4),
        },
        payload: {
            aggregateCompositeIdentifier: { type: AggregateType.song, id: buildDummyUuid(3) },
            translation: 'translation of song lyrics',
            languageCode: LanguageCode.English,
        },
    },
})
@CoscradEvent(SONG_LYRICS_TRANSLATED)
export class SongLyricsTranslated extends BaseEvent<SongLyricsTranslatedPayload> {
    type = SONG_LYRICS_TRANSLATED;
}
